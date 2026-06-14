import json
import logging
import os
import uuid
from urllib.parse import urlparse
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, AsyncIterator, Iterator, List, Literal, Optional, Sequence

import httpx
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator
from starlette.middleware.cors import CORSMiddleware

try:
    from motor.motor_asyncio import AsyncIOMotorClient
except ImportError:
    AsyncIOMotorClient = None

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def env_str(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def env_float(name: str, default: float) -> float:
    raw = env_str(name)
    if not raw:
        return default
    try:
        return float(raw)
    except ValueError:
        logger.warning("Invalid %s=%r; using %s", name, raw, default)
        return default


def cors_origins() -> List[str]:
    origins = [origin.strip() for origin in env_str("CORS_ORIGINS", "*").split(",")]
    origins = [origin for origin in origins if origin]
    return origins or ["*"]


mongo_url = env_str("MONGO_URL")
db_name = env_str("DB_NAME")
client = None
db = None

if mongo_url and db_name and AsyncIOMotorClient is not None:
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
else:
    logger.warning("MongoDB env is not configured; status-check persistence is disabled.")

@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    if client is not None:
        client.close()


app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")

MODEL_ID_TO_PROVIDER = {
    "claude-sonnet-4-5": "claude-sonnet-4.5",
    "claude-sonnet-4-5-1m": "claude-sonnet-4.5-1m",
    "deepseek-v4-flash": "deepseek-v4-flash",
    "deepseek-v3": "deepseek-v3",
    "gpt-4o": "gpt-4o",
    "o4-mini": "o4-mini",
}

DEFAULT_MODEL_ID = "claude-sonnet-4-5"
PROVIDER_NAME = "AIMurah"
DEFAULT_TIMEOUT_SECONDS = 120.0
MAX_PROVIDER_ERROR_CHARS = 800
FIRECRAWL_BASE_URL = "https://api.firecrawl.dev"
TAVILY_BASE_URL = "https://api.tavily.com"
DEFAULT_WEB_SEARCH_MAX_RESULTS = 10
DEFAULT_WEB_SEARCH_TIMEOUT_SECONDS = 12.0
DEFAULT_WEB_SEARCH_MAX_CONTEXT_CHARS = 6000
DEFAULT_WEB_SEARCH_MAX_RESULT_CHARS = 1000


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class ChatMessageIn(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

    @field_validator("content")
    @classmethod
    def trim_content(cls, value: str) -> str:
        return value.strip()


class ChatStreamRequest(BaseModel):
    messages: List[ChatMessageIn]
    model_id: Optional[str] = None
    auto_mode: bool = False
    room: Optional[str] = None
    attachments: List[str] = Field(default_factory=list)
    web_search: bool = False
    reasoning: bool = True

    @field_validator("model_id", "room", mode="before")
    @classmethod
    def trim_optional_string(cls, value):
        if value is None:
            return None
        return str(value).strip() or None

    @field_validator("attachments", mode="before")
    @classmethod
    def clean_attachments(cls, value):
        if value is None:
            return []
        if not isinstance(value, list):
            return []
        return [str(item).strip() for item in value if str(item).strip()]


class ModelInfo(BaseModel):
    id: str
    provider_model: str


class ModelsResponse(BaseModel):
    provider: str
    default_model_id: str
    fallback_model: str
    models: List[ModelInfo]


def sse(event: str, data: Any) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def provider_model(model_id: Optional[str], auto_mode: bool) -> str:
    fallback = env_str("OPENAI_MODEL")
    if auto_mode:
        return fallback or MODEL_ID_TO_PROVIDER.get(DEFAULT_MODEL_ID, "")
    return MODEL_ID_TO_PROVIDER.get(model_id or "", fallback)


def provider_url(base_url: str) -> str:
    clean = base_url.rstrip("/")
    if clean.endswith("/chat/completions"):
        return clean
    return f"{clean}/chat/completions"


def extract_delta_text(choice: dict) -> str:
    delta = choice.get("delta") or {}
    content = delta.get("content")
    return content if isinstance(content, str) else ""


def extract_reasoning_content(choice: dict) -> str:
    delta = choice.get("delta") or {}
    text = delta.get("reasoning_content") or delta.get("reasoning") or ""
    return text if isinstance(text, str) else ""


def has_user_content(messages: Sequence[ChatMessageIn]) -> bool:
    return any(message.content for message in messages)


def last_user_prompt(payload: ChatStreamRequest) -> str:
    for msg in reversed(payload.messages):
        if msg.role == "user" and msg.content:
            return " ".join(msg.content.split())
    return ""


def env_int(name: str, default: int) -> int:
    raw = env_str(name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        logger.warning("Invalid %s=%r; using %s", name, raw, default)
        return default


def extract_search_query(payload: ChatStreamRequest) -> str:
    return last_user_prompt(payload)[:500]


def normalize_firecrawl_results(data: Any) -> List[dict]:
    if not isinstance(data, dict):
        return []

    raw_results = data.get("data") or data.get("results") or []
    if isinstance(raw_results, dict):
        raw_results = raw_results.get("data") or raw_results.get("results") or []
    if not isinstance(raw_results, list):
        return []

    results = []
    for item in raw_results:
        if not isinstance(item, dict):
            continue
        metadata = item.get("metadata") if isinstance(item.get("metadata"), dict) else {}
        title = item.get("title") or metadata.get("title") or item.get("url") or "Untitled source"
        url = item.get("url") or metadata.get("sourceURL") or metadata.get("url") or ""
        content = (
            item.get("markdown")
            or item.get("content")
            or item.get("description")
            or item.get("snippet")
            or metadata.get("description")
            or ""
        )
        if url or content:
            results.append(
                {
                    "title": " ".join(str(title).split()),
                    "url": str(url).strip(),
                    "content": " ".join(str(content).split()),
                }
            )
    return results


async def firecrawl_search(query: str, max_results: int) -> List[dict]:
    api_key = env_str("FIRECRAWL_API_KEY")
    if not api_key:
        raise RuntimeError("FIRECRAWL_API_KEY belum dikonfigurasi")

    base_url = env_str("FIRECRAWL_BASE_URL", FIRECRAWL_BASE_URL).rstrip("/")
    timeout = env_float("WEB_SEARCH_TIMEOUT_SECONDS", DEFAULT_WEB_SEARCH_TIMEOUT_SECONDS)
    payload = {
        "query": query,
        "limit": max(1, min(max_results, 10)),
        "scrapeOptions": {"formats": ["markdown"]},
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(f"{base_url}/v2/search", headers=headers, json=payload)
        if response.status_code == 404:
            response = await client.post(f"{base_url}/v1/search", headers=headers, json=payload)
        response.raise_for_status()
        return normalize_firecrawl_results(response.json())


async def tavily_search(query: str, max_results: int) -> List[dict]:
    api_key = env_str("TAVILY_API_KEY")
    if not api_key:
        raise RuntimeError("TAVILY_API_KEY belum dikonfigurasi")

    base_url = env_str("TAVILY_BASE_URL", TAVILY_BASE_URL).rstrip("/")
    timeout = env_float("WEB_SEARCH_TIMEOUT_SECONDS", DEFAULT_WEB_SEARCH_TIMEOUT_SECONDS)
    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": "advanced",
        "max_results": max(1, min(max_results, 10)),
        "include_answer": False,
        "include_raw_content": True,
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(f"{base_url}/search", json=payload)
        response.raise_for_status()
        data = response.json()

    results = []
    for item in data.get("results") or []:
        if not isinstance(item, dict):
            continue
        title = item.get("title") or item.get("url") or "Untitled source"
        url = item.get("url") or ""
        content = item.get("raw_content") or item.get("content") or ""
        if url or content:
            results.append({
                "title": " ".join(str(title).split()),
                "url": str(url).strip(),
                "content": " ".join(str(content).split()),
                "provider": "tavily",
            })
    return results


async def web_search(query: str, max_results: int) -> tuple[str, List[dict]]:
    if env_str("TAVILY_API_KEY"):
        return "tavily", await tavily_search(query, max_results)
    return "firecrawl", await firecrawl_search(query, max_results)


def format_search_context(query: str, results: Sequence[dict]) -> str:
    max_context = env_int("WEB_SEARCH_MAX_CONTEXT_CHARS", DEFAULT_WEB_SEARCH_MAX_CONTEXT_CHARS)
    max_result = env_int("WEB_SEARCH_MAX_RESULT_CHARS", DEFAULT_WEB_SEARCH_MAX_RESULT_CHARS)

    def domain(url: str) -> str:
        try:
            return urlparse(url).hostname.replace("www.", "") or url
        except Exception:
            return url

    parts = [
        f'Hasil pencarian web untuk: "{query}"',
        "Gunakan hasil pencarian ini untuk menjawab pertanyaan pengguna.",
        "Rangkum informasi dari sumber-sumber dan berikan jawaban lengkap dalam Bahasa Indonesia.",
        "Sebutkan sumber secara alami, misal: 'Menurut detik.com...' atau 'Berdasarkan laporan dari BBC...'.",
        "JANGAN GUNAKAN format [1], [2], [3] untuk sitasi.",
        "",
    ]

    for result in results:
        title = result.get("title") or "Sumber"
        url = result.get("url") or ""
        d = domain(url)
        content = (result.get("content") or "")[:max_result]
        parts.append(f"[{d}] {title}")
        parts.append(f"URL: {url}")
        parts.append(f"Konten: {content}")
        parts.append("")

    context = "\n\n".join(parts)
    return context[:max_context]


def normalize_messages(payload: ChatStreamRequest, web_context: str = "") -> List[dict]:
    room_line = f"Current room: {payload.room}." if payload.room else ""
    attachment_line = (
        f"Attached filenames: {', '.join(payload.attachments)}."
        if payload.attachments
        else ""
    )
    web_line = f"\n\n{web_context}" if web_context else ""
    system = {
        "role": "system",
        "content": (
            "Kamu adalah MicroAgent, asisten AI yang sangat membantu. "
            "SELALU jawab dalam Bahasa Indonesia yang benar dan lengkap. "
            "Jangan asal jawab - berikan jawaban yang informatif, akurat, dan bermanfaat. "
            "Jika pertanyaan kurang jelas, minta klarifikasi sebelum menjawab. "
            "Gunakan paragraf yang terstruktur dengan baik. "
            "Untuk topik teknis, berikan contoh jika memungkinkan. "
            "Jika menggunakan informasi dari web, sebutkan sumbernya secara alami dalam kalimat (misal: 'Menurut detik.com...'), JANGAN gunakan format angka seperti [1] atau [2] untuk sitasi. "
            f"{room_line} {attachment_line}".strip()
            + web_line
        ),
    }
    messages = [m.model_dump() for m in payload.messages if m.content.strip()]
    return [system, *messages]


def stream_provider(payload: ChatStreamRequest, web_context: str = "") -> Iterator[str]:
    if not has_user_content(payload.messages):
        yield sse("error", {"message": "Harap kirim pesan yang tidak kosong."})
        return

    base_url = env_str("OPENAI_BASE_URL")
    api_key = env_str("OPENAI_API_KEY")
    timeout = env_float("OPENAI_TIMEOUT_SECONDS", DEFAULT_TIMEOUT_SECONDS)
    model = provider_model(payload.model_id, payload.auto_mode)

    yield sse(
        "meta",
        {"provider": PROVIDER_NAME, "model": model, "autoMode": payload.auto_mode},
    )

    if not base_url or not api_key or not model:
        yield sse(
            "error",
            {
                "message": (
                    f"{PROVIDER_NAME} belum dikonfigurasi. Set OPENAI_BASE_URL, "
                    "OPENAI_API_KEY, dan OPENAI_MODEL di backend/.env."
                )
            },
        )
        return

    body = {
        "model": model,
        "messages": normalize_messages(payload, web_context=web_context),
        "stream": True,
        "temperature": 0.7,
    }
    if payload.reasoning:
        body["reasoning_effort"] = "medium"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }

    try:
        with requests.post(
            provider_url(base_url),
            headers=headers,
            json=body,
            stream=True,
            timeout=timeout,
        ) as response:
            response.encoding = "utf-8"
            if response.status_code >= 400:
                detail = response.text[:MAX_PROVIDER_ERROR_CHARS]
                logger.warning(
                    "%s error %s: %s", PROVIDER_NAME, response.status_code, detail
                )
                yield sse(
                    "error",
                    {"message": f"{PROVIDER_NAME} error {response.status_code}: {detail}"},
                )
                return

            for raw_line in response.iter_lines(decode_unicode=True):
                if not raw_line:
                    continue
                line = raw_line.strip()
                if line.startswith("data:"):
                    line = line[5:].strip()
                if line == "[DONE]":
                    yield sse("done", {"status": "completed"})
                    return
                try:
                    chunk = json.loads(line)
                except json.JSONDecodeError:
                    logger.debug("Skipping malformed provider stream line: %s", line[:200])
                    continue

                choices = chunk.get("choices") or []
                if not choices:
                    continue
                choice = choices[0] or {}

                reasoning = extract_reasoning_content(choice)
                if reasoning and payload.reasoning:
                    yield sse("reasoning", {"text": reasoning})

                token = extract_delta_text(choice)
                if token:
                    yield sse("token", {"text": token})
                if choice.get("finish_reason"):
                    yield sse("done", {"status": "completed"})
                    return

            yield sse("done", {"status": "completed"})
    except requests.RequestException as exc:
        logger.exception("%s streaming failed", PROVIDER_NAME)
        yield sse("error", {"message": f"Gagal konek ke {PROVIDER_NAME}: {exc}"})


@api_router.get("/", response_class=HTMLResponse)
async def root():
    return HTMLResponse(API_STATUS_HTML)


_API_STATUS_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>MicroAgent — API Status</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,sans-serif;background:#111;color:#e5e7eb;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.container{max-width:680px;width:100%;background:#1a1a1a;border-radius:24px;padding:32px;box-shadow:0 25px 50px -12px rgba(0,0,0,.6)}
h1{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:20px;margin-bottom:4px}
.sub{color:#6b7280;font-size:13px;margin-bottom:24px}
.grid{display:flex;flex-direction:column;gap:10px}
.card{display:flex;align-items:center;gap:14px;background:#222;border-radius:14px;padding:14px 18px;transition:background.15s}
.card:hover{background:#282828}
.status-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;background:#374151;transition:background.3s}
.status-dot.ok{background:#22c55e;box-shadow:0 0 6px rgba(34,197,94,.4)}
.status-dot.err{background:#ef4444;box-shadow:0 0 6px rgba(239,68,68,.4)}
.status-dot.pending{background:#374151;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.info{flex:1;min-width:0}
.info .name{font-size:13px;font-weight:500}
.info .desc{font-size:11px;color:#6b7280;margin-top:1px}
.badge{font-size:10px;font-weight:600;padding:3px 9px;border-radius:999px;flex-shrink:0}
.badge.latency{background:#1f2937;color:#9ca3af}
.badge.ok{background:rgba(34,197,94,.15);color:#22c55e}
.badge.err{background:rgba(239,68,68,.15);color:#ef4444}
.summary{display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap}
.summary-item{flex:1;min-width:100px;background:#222;border-radius:14px;padding:14px 16px;text-align:center}
.summary-item .num{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:600}
.summary-item .num.ok{color:#22c55e}
.summary-item .num.err{color:#ef4444}
.summary-item .label{font-size:11px;color:#6b7280;margin-top:2px}
.footer{margin-top:20px;padding-top:16px;border-top:1px solid #222;display:flex;justify-content:space-between;align-items:center}
.footer a{color:#6366f1;font-size:12px;text-decoration:none}
.footer a:hover{text-decoration:underline}
.footer .ts{color:#4b5563;font-size:11px}
.response-preview{margin-top:8px;background:#111;border-radius:10px;padding:10px 12px;font-family:'SF Mono',Monaco,monospace;font-size:11px;line-height:1.5;color:#9ca3af;max-height:60px;overflow-y:auto;display:none;white-space:pre-wrap;word-break:break-all}
.response-preview.show{display:block}
.details-btn{background:0;border:0;color:#4b5563;font-size:10px;cursor:pointer;padding:2px 0}
.details-btn:hover{color:#9ca3af}
</style>
</head>
<body>
<div class="container">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:2px">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
    <h1>API Status</h1>
  </div>
  <p class="sub">Live health check for MicroAgent backend services</p>

  <div class="summary" id="summary">
    <div class="summary-item"><div class="num" id="totalCt">0</div><div class="label">Total</div></div>
    <div class="summary-item"><div class="num ok" id="okCt">0</div><div class="label">Healthy</div></div>
    <div class="summary-item"><div class="num err" id="errCt">0</div><div class="label">Errors</div></div>
  </div>

  <div class="grid" id="grid"></div>

  <div class="footer">
    <a href="/api/models" target="_blank">View models →</a>
    <span class="ts" id="timestamp"></span>
  </div>
</div>
<script>
const ENDPOINTS = [
  {path:"/api/",name:"Root",desc:"Server alive check"},
  {path:"/api/models",name:"Models",desc:"AI model configuration"},
  {path:"/api/status",name:"Status",desc:"Health records"},
  {path:"/api/chat/stream",name:"Chat Stream",desc:"SSE streaming endpoint (POST)"},
];

const grid = document.getElementById("grid");
const okCt = document.getElementById("okCt");
const errCt = document.getElementById("errCt");
const totalCt = document.getElementById("totalCt");

function dot(status){return status==='ok'?'ok':status==='err'?'err':'pending'}
function badge(status,ms){
  if(status==='ok') return `<span class="badge ok">${ms}ms</span>`;
  if(status==='err') return `<span class="badge err">Error</span>`;
  return `<span class="badge latency">—</span>`;
}

function render(ep,status,ms,body){
  const d=dot(status);
  const row=document.createElement('div');
  row.innerHTML=`
    <div class="card" data-path="${ep.path}">
      <div class="status-dot ${d}" data-dot></div>
      <div class="info">
        <div class="name">${ep.name}</div>
        <div class="desc">${ep.desc}</div>
        <div class="response-preview" data-preview>${body||''}</div>
      </div>
      ${status==='pending'?'':badge(status,ms)}
      <button class="details-btn" data-toggle style="${status==='pending'?'display:none':''}">details</button>
    </div>
  `;
  const card=row.firstElementChild;
  card.querySelector('[data-toggle]')?.addEventListener('click',()=>{
    const pre=card.querySelector('[data-preview]');
    pre.classList.toggle('show');
  });
  return card;
}

async function check(ep){
  const card=render(ep,'pending');
  grid.appendChild(card);

  const dotEl=card.querySelector('[data-dot]');
  const start=performance.now();
  try{
    let ok=false,body='';
    if(ep.path.includes('/chat/stream')){
      const r=await fetch(ep.path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:'ping'}]})});
      ok=r.ok;
      body=r.ok?'POST 204 No Content (SSE)':await r.text().then(t=>t.slice(0,300));
    }else{
      const r=await fetch(ep.path);
      body=r.ok?await r.text():await r.text().then(t=>t.slice(0,300));
      ok=r.ok;
    }
    const ms=Math.round(performance.now()-start);
    const newCard=render(ep,ok?'ok':'err',ms,body);
    card.replaceWith(newCard);
    updateSummary();
  }catch(e){
    const ms=Math.round(performance.now()-start);
    const newCard=render(ep,'err',ms,e.message);
    card.replaceWith(newCard);
    updateSummary();
  }
}

function updateSummary(){
  const cards=document.querySelectorAll('.card');
  let ok=0,err=0;
  cards.forEach(c=>{
    const dot=c.querySelector('[data-dot]');
    if(dot.classList.contains('ok')) ok++;
    else if(dot.classList.contains('err')) err++;
  });
  totalCt.textContent=cards.length;
  okCt.textContent=ok;
  errCt.textContent=err;
}

document.getElementById('timestamp').textContent=new Date().toLocaleString();
ENDPOINTS.forEach(check);
</script>
</body>
</html>"""


API_STATUS_HTML = _API_STATUS_HTML


MODELS_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>MicroAgent — Available Models</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:Inter,system-ui,sans-serif;background:#111;color:#e5e7eb;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}}
.container{{max-width:680px;width:100%;background:#1a1a1a;border-radius:24px;padding:32px;box-shadow:0 25px 50px -12px rgba(0,0,0,.6)}}
h1{{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:20px;margin-bottom:2px}}
.sub{{color:#6b7280;font-size:13px;margin-bottom:20px}}
.info-bar{{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}}
.info-item{{background:#222;border-radius:12px;padding:10px 14px;flex:1;min-width:100px}}
.info-item .lbl{{font-size:11px;color:#6b7280}}
.info-item .val{{font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:600;margin-top:1px;color:#e5e7eb}}
.grid{{display:flex;flex-direction:column;gap:8px}}
.card{{display:flex;align-items:center;gap:14px;background:#222;border-radius:14px;padding:14px 18px;transition:background.15s}}
.card:hover{{background:#282828}}
.card .dot{{width:10px;height:10px;border-radius:50%;flex-shrink:0;background:#22c55e;box-shadow:0 0 6px rgba(34,197,94,.4)}}
.card .info{{flex:1;min-width:0}}
.card .info .name{{font-size:13px;font-weight:500}}
.card .info .prov{{font-size:11px;color:#6b7280;margin-top:1px;font-family:'SF Mono',Monaco,monospace}}
.card .tag{{font-size:10px;font-weight:600;padding:3px 9px;border-radius:999px;background:rgba(99,102,241,.15);color:#818cf8;flex-shrink:0}}
.footer{{margin-top:20px;padding-top:16px;border-top:1px solid #222;display:flex;justify-content:space-between;align-items:center}}
.footer a{{color:#6366f1;font-size:12px;text-decoration:none}}
.footer a:hover{{text-decoration:underline}}
.footer .ts{{color:#4b5563;font-size:11px}}
</style>
</head>
<body>
<div class="container">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:2px">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
    <h1>Available Models</h1>
  </div>
  <p class="sub">AI models configured on this MicroAgent instance</p>

  <div class="info-bar">
    <div class="info-item"><div class="lbl">Provider</div><div class="val">{{provider}}</div></div>
    <div class="info-item"><div class="lbl">Default</div><div class="val">{{default_model}}</div></div>
    <div class="info-item"><div class="lbl">Fallback</div><div class="val">{{fallback}}</div></div>
  </div>

  <div class="grid" id="grid"></div>

  <div class="footer">
    <a href="/api/">Back to status →</a>
    <span class="ts" id="timestamp"></span>
  </div>
</div>
<script>
const MODELS = {models_json};

const grid = document.getElementById('grid');
MODELS.forEach(m => {{
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="dot"></div>
    <div class="info">
      <div class="name">${{m.id}}</div>
      <div class="prov">${{m.provider_model}}</div>
    </div>
    <span class="tag">active</span>
  `;
  grid.appendChild(card);
}});
document.getElementById('timestamp').textContent = new Date().toLocaleString();
</script>
</body>
</html>"""


@api_router.get("/models")
async def get_models(request: Request):
    data = ModelsResponse(
        provider=PROVIDER_NAME,
        default_model_id=DEFAULT_MODEL_ID,
        fallback_model=env_str("OPENAI_MODEL"),
        models=[
            ModelInfo(id=model_id, provider_model=provider)
            for model_id, provider in MODEL_ID_TO_PROVIDER.items()
        ],
    )
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        return HTMLResponse(MODELS_HTML.format(
            provider=data.provider,
            default_model=data.default_model_id,
            fallback=data.fallback_model,
            models_json=json.dumps([m.model_dump() for m in data.models], indent=2),
        ))
    return JSONResponse(data.model_dump())


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)

    if db is not None:
        doc = status_obj.model_dump()
        doc["timestamp"] = doc["timestamp"].isoformat()
        _ = await db.status_checks.insert_one(doc)

    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    if db is None:
        return []

    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check["timestamp"], str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])

    return status_checks


async def stream_chat_response(payload: ChatStreamRequest) -> AsyncIterator[str]:
    web_context = ""
    if payload.web_search:
        query = extract_search_query(payload)
        provider = "tavily" if env_str("TAVILY_API_KEY") else "firecrawl"
        yield sse(
            "status",
            {
                "phase": "web_search",
                "provider": provider,
                "status": "started",
                "query": query,
                "message": f"Searching the web for: {query}",
            },
        )
        try:
            max_results = env_int("WEB_SEARCH_MAX_RESULTS", DEFAULT_WEB_SEARCH_MAX_RESULTS)
            provider, results = await web_search(query, max_results=max_results)
            yield sse(
                "status",
                {
                    "phase": "web_search",
                    "provider": provider,
                    "status": "results",
                    "query": query,
                    "results": [
                        {"title": r.get("title"), "url": r.get("url")}
                        for r in results[:max_results]
                    ],
                },
            )
            web_context = format_search_context(query, results) if results else ""
            yield sse(
                "status",
                {
                    "phase": "web_fetch",
                    "provider": provider,
                    "status": "completed",
                    "result_count": len(results),
                    "message": f"Fetched {len(results)} web sources for synthesis.",
                },
            )
        except Exception as exc:
            logger.warning("Web search failed: %s", exc)
            yield sse(
                "status",
                {
                    "phase": "web_search",
                    "provider": provider,
                    "status": "failed",
                    "message": "Web search unavailable; continuing without web context.",
                },
            )

    for event in stream_provider(payload, web_context=web_context):
        yield event


@api_router.post("/chat/stream")
async def chat_stream(payload: ChatStreamRequest):
    return StreamingResponse(
        stream_chat_response(payload),
        media_type="text/event-stream; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


app.include_router(api_router)

origins = cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_credentials="*" not in origins,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

