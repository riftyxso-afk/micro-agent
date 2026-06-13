import json
import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, AsyncIterator, Iterator, List, Literal, Optional, Sequence

import httpx
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from fastapi.responses import StreamingResponse
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
    "combo-wombo": "minimaxai/minimax-m3",
    "gemini-2-5-flash-lite": "deepseek-ai/deepseek-v4-flash",
    "minimax-m2-7": "minimaxai/minimax-m3",
    "claude-haiku-4-5": "deepseek-ai/deepseek-v4-flash",
    "kimi-k2-6": "moonshotai/kimi-k2.6",
    "grok-4-3": "deepseek-ai/deepseek-v4-flash",
    "deepseek-v4-pro": "deepseek-ai/deepseek-v4-flash",
    "gemini-3-1-pro": "deepseek-ai/deepseek-v4-flash",
    "gpt-5-5": "deepseek-ai/deepseek-v4-flash",
}

DEFAULT_MODEL_ID = "combo-wombo"
PROVIDER_NAME = "NVIDIA"
DEFAULT_TIMEOUT_SECONDS = 120.0
MAX_PROVIDER_ERROR_CHARS = 800
FIRECRAWL_BASE_URL = "https://api.firecrawl.dev"
TAVILY_BASE_URL = "https://api.tavily.com"
DEFAULT_WEB_SEARCH_MAX_RESULTS = 5
DEFAULT_WEB_SEARCH_TIMEOUT_SECONDS = 12.0
DEFAULT_WEB_SEARCH_MAX_CONTEXT_CHARS = 6000
DEFAULT_WEB_SEARCH_MAX_RESULT_CHARS = 1000

SAFE_THINKING_STEPS = [
    "Connecting to NVIDIA API",
    "Preparing model request",
    "Streaming response",
]

DYNAMIC_THINKING = {
    "Chat Room": {
        "general": ["Understanding your request", "Analyzing the context", "Structuring the answer"],
        "code": ["Analyzing code request", "Reviewing requirements", "Writing solution"],
        "analyze": ["Parsing input data", "Identifying patterns", "Preparing insights"],
        "write": ["Planning content structure", "Drafting response", "Polishing output"],
        "default": ["Understanding your request", "Analyzing the context", "Structuring the answer"],
    },
    "Research Room": ["Scanning sources", "Cross-referencing facts", "Compiling findings"],
    "Content Room": ["Planning content structure", "Drafting response", "Polishing output"],
    "File/Research Mode": ["Parsing input data", "Identifying patterns", "Preparing insights"],
    "Image Mode": ["Analyzing visual concept", "Designing description", "Finalizing output"],
    "Study/Reasoning Mode": ["Breaking down problem", "Applying logic", "Formulating answer"],
}


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
    parts = [
        f'Hasil pencarian web untuk: "{query}"',
        "Gunakan hasil pencarian ini sebagai referensi untuk menjawab pertanyaan pengguna.",
        "Rangkum informasi dari sumber-sumber tersebut dan berikan jawaban lengkap dalam Bahasa Indonesia.",
        "Sitasi sumber dengan format [nama] di akhir kalimat.",
        "",
    ]

    for index, result in enumerate(results, start=1):
        title = result.get("title") or "Sumber"
        url = result.get("url") or ""
        content = (result.get("content") or "")[:max_result]
        parts.append(f"[{index}] {title}")
        parts.append(f"URL: {url}")
        parts.append(f"Konten: {content}")
        parts.append("")

    context = "\n\n".join(parts)
    return context[:max_context]


def fallback_thinking_summary(payload: ChatStreamRequest) -> str:
    prompt = last_user_prompt(payload)
    room = payload.room or "Chat Room"
    if not prompt:
        return "I need a clear prompt before composing the answer."
    preview = prompt[:140] + ("…" if len(prompt) > 140 else "")
    return f"The user asks about “{preview}”. The final answer should explain the main concept, include the most relevant details, and stay clear for {room}."


def generate_visible_thinking(
    payload: ChatStreamRequest,
    base_url: str,
    api_key: str,
    model: str,
    timeout: float,
) -> str:
    """Ask provider for a short visible summary. This is not hidden chain-of-thought."""
    prompt = last_user_prompt(payload)
    if not prompt:
        return fallback_thinking_summary(payload)

    body = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Write a visible thinking summary for a chat UI. This is NOT the final answer. "
                    "Do not answer the user directly. Do not solve the prompt. "
                    "Describe what the user is asking for, what concepts/details the final answer should cover, "
                    "and what style the final answer should use. "
                    "Start with 'The user asks...' or 'The user wants...'. "
                    "Do not reveal private chain-of-thought. Do not mention policies. "
                    "Maximum 2 concise sentences."
                ),
            },
            {
                "role": "user",
                "content": f"Room: {payload.room or 'Chat Room'}\nPrompt: {prompt}",
            },
        ],
        "stream": False,
        "temperature": 0.2,
        "max_tokens": 130,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            provider_url(base_url),
            headers=headers,
            json=body,
            timeout=min(timeout, 12.0),
        )
        if response.status_code >= 400:
            logger.warning("%s thinking summary error %s: %s", PROVIDER_NAME, response.status_code, response.text[:300])
            return fallback_thinking_summary(payload)
        data = response.json()
        choices = data.get("choices") or []
        message = (choices[0] or {}).get("message") or {} if choices else {}
        content = message.get("content") if isinstance(message, dict) else ""
        clean = " ".join(str(content or "").split())
        if not clean:
            return fallback_thinking_summary(payload)
        allowed_prefixes = ("the user asks", "the user wants", "user asks", "user wants")
        if not clean.lower().startswith(allowed_prefixes):
            logger.warning("Provider returned answer-like thinking; using fallback: %s", clean[:160])
            return fallback_thinking_summary(payload)
        return clean
    except Exception as exc:
        logger.warning("%s thinking summary failed: %s", PROVIDER_NAME, exc)
        return fallback_thinking_summary(payload)


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

    visible_thinking = "Understanding your request and preparing response..."
    yield sse("thinking", {"step": visible_thinking})

    body = {
        "model": model,
        "messages": normalize_messages(payload, web_context=web_context),
        "stream": True,
        "temperature": 0.7,
    }
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


@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.get("/models", response_model=ModelsResponse)
async def get_models():
    return ModelsResponse(
        provider=PROVIDER_NAME,
        default_model_id=DEFAULT_MODEL_ID,
        fallback_model=env_str("OPENAI_MODEL"),
        models=[
            ModelInfo(id=model_id, provider_model=provider)
            for model_id, provider in MODEL_ID_TO_PROVIDER.items()
        ],
    )


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

