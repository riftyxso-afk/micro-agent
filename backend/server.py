import io
import json
import logging
import os
import re
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

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Preformatted
    from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

try:
    from docx import Document as DocxDocument
    from docx.shared import Pt, RGBColor, Inches, Cm
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
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
    "claude-sonnet-4-5-1m": "claude-sonnet-4.5-1m",
    "deepseek-v4-flash": "deepseek-v4-flash",
    "glm-5": "glm-5",
    "claude-opus-4-8": "claude-opus-4.8",
    "kimi-k2.6": "kimi-k2.6",
    "minimax-m3": "minimax-m3",
}

IMAGE_MODEL_ID = "flux-2-klein-4b"
DEFAULT_MODEL_ID = "deepseek-v4-flash"
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
    search_mode_prompt: str = ""
    skill_slug: Optional[str] = None

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
    if auto_mode or not model_id:
        return MODEL_ID_TO_PROVIDER.get(DEFAULT_MODEL_ID, DEFAULT_MODEL_ID)
    # Always use the model_id as-is — never fall back to OPENAI_MODEL env
    return MODEL_ID_TO_PROVIDER.get(model_id, model_id)


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
    """Try Tavily first, fallback to Firecrawl. Raise if neither is configured."""
    if env_str("TAVILY_API_KEY"):
        try:
            results = await tavily_search(query, max_results)
            return "tavily", results
        except Exception as exc:
            logger.warning("Tavily search failed, trying Firecrawl: %s", exc)
    if env_str("FIRECRAWL_API_KEY"):
        try:
            results = await firecrawl_search(query, max_results)
            return "firecrawl", results
        except Exception as exc:
            logger.warning("Firecrawl search failed: %s", exc)
    raise RuntimeError("Tidak ada API key pencarian web yang dikonfigurasi (TAVILY_API_KEY atau FIRECRAWL_API_KEY)")


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


# ── Skills ───────────────────────────────────────────────────────────────────

SKILLS_DIR = ROOT_DIR.parent / "skills"

BUILTIN_SKILLS = [
    {"slug": "email-writer",   "name": "Email Writer",    "icon": "📧", "category": "writing",  "description": "Write professional emails with proper structure"},
    {"slug": "code-reviewer",  "name": "Code Reviewer",   "icon": "🔍", "category": "coding",   "description": "Review code for bugs, performance, and best practices"},
    {"slug": "data-analyst",   "name": "Data Analyst",    "icon": "📊", "category": "analysis", "description": "Analyze data and provide insights"},
    {"slug": "content-writer", "name": "Content Writer",  "icon": "✍️", "category": "writing",  "description": "Create engaging content for social media and blogs"},
    {"slug": "seo-writer",     "name": "SEO Writer",      "icon": "🔎", "category": "writing",  "description": "Write SEO-optimized articles that rank on Google"},
]


def load_skill(slug: str) -> Optional[str]:
    """Load skill content from static .md file."""
    path = SKILLS_DIR / f"{slug}.md"
    if path.exists():
        return path.read_text(encoding="utf-8")
    return None


@api_router.get("/skills")
async def list_skills():
    skills = []
    for s in BUILTIN_SKILLS:
        content = load_skill(s["slug"])
        skills.append({**s, "available": content is not None})
    return JSONResponse({"skills": skills})


def normalize_messages(payload: ChatStreamRequest, web_context: str = "") -> List[dict]:
    room_line = f"Current room: {payload.room}." if payload.room else ""
    attachment_line = (
        f"Attached filenames: {', '.join(payload.attachments)}."
        if payload.attachments
        else ""
    )
    web_line = f"\n\n{web_context}" if web_context else ""
    search_mode_line = (
        f"\n\nINSTRUKSI MODE PENCARIAN: {payload.search_mode_prompt.strip()}"
        if payload.search_mode_prompt and payload.search_mode_prompt.strip()
        else ""
    )
    qna_rules = (
        "\n\nATURAN KLARIFIKASI (QNA) - PENTING:\n"
        "Jika permintaan pengguna ambigu/samar, WAJIB gunakan format QNA berikut (jangan tebak-tebakan):\n"
        "<QNA>\n"
        "{\n"
        "  \"question\": \"Pertanyaan klarifikasi yang jelas\",\n"
        "  \"options\": [\n"
        "    {\"id\": \"a\", \"label\": \"Label Pendek\", \"description\": \"penjelasan singkat\"},\n"
        "    {\"id\": \"b\", \"label\": \"Label Pendek\", \"description\": \"penjelasan singkat\"}\n"
        "  ],\n"
        "  \"allow_custom\": true\n"
        "}\n"
        "</QNA>\n\n"
        "KAPAN GUNAKAN QNA (contoh nyata):\n"
        "- 'buatkan pertanyaan' \u2192 GUNAKAN QNA: pertanyaan untuk apa? (diskusi/kuis/survei/refleksi)\n"
        "- 'buatkan konten' \u2192 GUNAKAN QNA: konten apa? platform apa?\n"
        "- 'analisis ini' \u2192 GUNAKAN QNA: analisis dari sudut apa?\n"
        "- 'buat rangkuman' \u2192 GUNAKAN QNA: untuk keperluan apa?\n"
        "- 'tolong bantu' \u2192 GUNAKAN QNA: bantu apa?\n\n"
        "KAPAN JANGAN GUNAKAN QNA:\n"
        "- 'apa itu AI?' \u2192 jelas, jawab langsung\n"
        "- 'buatkan pdf absensi 10 orang' \u2192 spesifik, langsung kerjakan\n"
        "- 'terjemahkan ke Inggris' \u2192 jelas, langsung kerjakan\n\n"
        "ATURAN QNA: Maksimal 4 opsi. Label 2-5 kata. allow_custom: true jika ada kemungkinan lain. "
        "Setelah user memilih, LANGSUNG kerjakan tanpa tanya lagi. Satu QNA per giliran.\n\n"
        "ATURAN KRITIS - [QNA_ANSWER]:\n"
        "Jika pesan user dimulai dengan [QNA_ANSWER], artinya user baru saja menjawab pertanyaan klarifikasimu. "
        "WAJIB:\n"
        "1. Langsung kerjakan tugas asli berdasarkan jawaban tersebut\n"
        "2. JANGAN keluarkan <QNA> lagi\n"
        "3. JANGAN tanya klarifikasi lagi\n"
        "Contoh: user kirim '[QNA_ANSWER] Kuis: pertanyaan untuk menguji pengetahuan' \u2192 langsung buat soal kuis, tidak perlu tanya lagi."
    )
    # Inject skill if specified
    skill_block = ""
    if payload.skill_slug:
        skill_content = load_skill(payload.skill_slug)
        if skill_content:
            skill_block = (
                f"\n\n---SKILL START---\n{skill_content}\n---SKILL END---\n"
                "Baca dan ikuti instruksi skill di atas sebelum merespons."
            )

    system = {
        "role": "system",
        "content": (
            "Kamu adalah MicroAgent, asisten AI yang sangat membantu. "
            "SELALU jawab dalam Bahasa Indonesia yang benar dan lengkap. "
            "Jangan asal jawab - berikan jawaban yang informatif, akurat, dan bermanfaat. "
            "Gunakan paragraf yang terstruktur dengan baik. "
            "Untuk topik teknis, berikan contoh jika memungkinkan. "
            "Jika menggunakan informasi dari web, sebutkan sumbernya secara alami dalam kalimat (misal: 'Menurut detik.com...'), JANGAN gunakan format angka seperti [1] atau [2] untuk sitasi. "
            "\n\nPENTING - ATURAN PEMBUATAN DOKUMEN:"
            "Jika pengguna meminta membuat dokumen (PDF, Word, DOCX, laporan, surat, tabel, absensi, proposal, resume, dll), "
            "JANGAN pernah membalas dengan kode Python atau kode pemrograman apapun. "
            "Sebaliknya, langsung tulis ISI DOKUMEN LENGKAP dalam format Markdown yang rapi dan profesional. "
            "Gunakan heading (#, ##, ###), tabel Markdown, bullet list, bold, dan format lain yang sesuai. "
            "Sertakan semua konten yang diminta secara lengkap \u2014 judul, isi, tabel, catatan, dll \u2014 seolah-olah itu adalah dokumen final yang siap dicetak. "
            "Di akhir respons, tambahkan baris: '> **[DOKUMEN SIAP]** Klik tombol *Unduh Dokumen* di bawah untuk menyimpan sebagai PDF, Word, atau format lainnya.' "
            + qna_rules
            + skill_block
            + f"{room_line} {attachment_line}".strip()
            + search_mode_line
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
    # When web_search is active, use higher reasoning effort so model
    # fully synthesizes web context before generating the answer.
    # When only reasoning (no web), use medium effort.
    if payload.reasoning:
        body["reasoning_effort"] = "high" if web_context else "medium"
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


# ── Document Generation ─────────────────────────────────────────────────────

class DocumentRequest(BaseModel):
    content: str
    format: Literal["pdf", "docx", "txt", "md"] = "pdf"
    title: str = "MicroAgent Document"
    model_id: Optional[str] = None

    @field_validator("content", "title")
    @classmethod
    def strip_str(cls, v: str) -> str:
        return v.strip()


def _is_table_row(line: str) -> bool:
    """Check if a line looks like a markdown table row."""
    stripped = line.strip()
    return stripped.startswith("|") and stripped.endswith("|")


def _is_table_separator(line: str) -> bool:
    """Check if a line is a markdown table separator row like |---|---|."""
    stripped = line.strip()
    if not stripped.startswith("|") or not stripped.endswith("|"):
        return False
    inner = stripped[1:-1]
    return all(re.match(r'^\s*:?-+:?\s*$', cell) for cell in inner.split("|") if cell.strip())


def _parse_table_row(line: str) -> List[str]:
    """Parse a markdown table row into a list of cell strings."""
    stripped = line.strip()
    if stripped.startswith("|"):
        stripped = stripped[1:]
    if stripped.endswith("|"):
        stripped = stripped[:-1]
    return [cell.strip() for cell in stripped.split("|")]


def _parse_markdown_blocks(text: str) -> List[dict]:
    """
    Parse markdown text into typed blocks:
    heading, table, code, bullet, paragraph.
    """
    blocks: List[dict] = []
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        # Fenced code block
        if line.strip().startswith("```"):
            lang = line.strip()[3:].strip()
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            blocks.append({"type": "code", "lang": lang, "text": "\n".join(code_lines)})
        # Markdown table — detect header row followed by separator
        elif (
            _is_table_row(line)
            and i + 1 < len(lines)
            and _is_table_separator(lines[i + 1])
        ):
            headers = _parse_table_row(line)
            i += 2  # skip header + separator
            rows = []
            while i < len(lines) and _is_table_row(lines[i]):
                rows.append(_parse_table_row(lines[i]))
                i += 1
            blocks.append({"type": "table", "headers": headers, "rows": rows})
            continue  # i already advanced
        # Heading
        elif re.match(r'^#{1,6}\s', line):
            level = len(re.match(r'^(#+)', line).group(1))
            text_content = re.sub(r'^#+\s*', '', line).strip()
            blocks.append({"type": "heading", "level": level, "text": text_content})
        # Bullet / list
        elif re.match(r'^[\*\-\+]\s', line) or re.match(r'^\d+\.\s', line):
            item_text = re.sub(r'^([\*\-\+]|\d+\.)\s*', '', line).strip()
            blocks.append({"type": "bullet", "text": item_text})
        # Horizontal rule
        elif re.match(r'^[-_\*]{3,}\s*$', line):
            blocks.append({"type": "hr"})
        # Blank line → flush paragraph
        elif line.strip() == "":
            blocks.append({"type": "spacer"})
        # Regular paragraph text
        else:
            # Accumulate consecutive paragraph lines
            para_lines = [line]
            while (
                i + 1 < len(lines)
                and lines[i + 1].strip() != ""
                and not re.match(r'^#{1,6}\s', lines[i + 1])
                and not lines[i + 1].strip().startswith("```")
                and not re.match(r'^[\*\-\+]\s', lines[i + 1])
                and not re.match(r'^\d+\.\s', lines[i + 1])
                and not re.match(r'^[-_\*]{3,}\s*$', lines[i + 1])
                and not _is_table_row(lines[i + 1])
            ):
                i += 1
                para_lines.append(lines[i])
            blocks.append({"type": "paragraph", "text": " ".join(para_lines)})
        i += 1
    return blocks


def _strip_md_inline(text: str) -> str:
    """Remove inline markdown (bold, italic, backticks, links)."""
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'__(.+?)__', r'\1', text)
    text = re.sub(r'_(.+?)_', r'\1', text)
    text = re.sub(r'`(.+?)`', r'\1', text)
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
    return text


def generate_pdf(content: str, title: str) -> bytes:
    if not REPORTLAB_AVAILABLE:
        raise RuntimeError("reportlab tidak tersedia")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Title"],
        fontSize=20,
        leading=26,
        spaceAfter=6,
        textColor=colors.HexColor("#111111"),
        fontName="Helvetica-Bold",
    )
    h1_style = ParagraphStyle(
        "H1", parent=styles["Heading1"], fontSize=15, leading=20,
        spaceBefore=14, spaceAfter=4, textColor=colors.HexColor("#111111"),
        fontName="Helvetica-Bold",
    )
    h2_style = ParagraphStyle(
        "H2", parent=styles["Heading2"], fontSize=13, leading=18,
        spaceBefore=10, spaceAfter=3, textColor=colors.HexColor("#1D4ED8"),
        fontName="Helvetica-Bold",
    )
    h3_style = ParagraphStyle(
        "H3", parent=styles["Heading3"], fontSize=11, leading=16,
        spaceBefore=8, spaceAfter=2, textColor=colors.HexColor("#374151"),
        fontName="Helvetica-Bold",
    )
    body_style = ParagraphStyle(
        "Body", parent=styles["Normal"], fontSize=10, leading=15,
        spaceAfter=6, textColor=colors.HexColor("#111111"),
        alignment=TA_JUSTIFY, fontName="Helvetica",
    )
    bullet_style = ParagraphStyle(
        "Bullet", parent=styles["Normal"], fontSize=10, leading=14,
        spaceAfter=3, leftIndent=14, bulletIndent=4,
        textColor=colors.HexColor("#111111"), fontName="Helvetica",
    )
    code_style = ParagraphStyle(
        "Code", parent=styles["Code"], fontSize=8, leading=12,
        spaceBefore=6, spaceAfter=6,
        backColor=colors.HexColor("#F3F4F6"),
        textColor=colors.HexColor("#1F2937"),
        leftIndent=10, rightIndent=10,
        fontName="Courier",
    )
    meta_style = ParagraphStyle(
        "Meta", parent=styles["Normal"], fontSize=9, leading=12,
        spaceAfter=12, textColor=colors.HexColor("#6B7280"),
        fontName="Helvetica",
    )

    heading_styles = {1: h1_style, 2: h2_style, 3: h3_style, 4: h3_style, 5: h3_style, 6: h3_style}

    story = []
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 4))

    from reportlab.platypus import Table as RLTable, TableStyle as RLTableStyle

    blocks = _parse_markdown_blocks(content)
    for block in blocks:
        btype = block["type"]
        if btype == "heading":
            lvl = block["level"]
            st = heading_styles.get(lvl, h3_style)
            story.append(Paragraph(_strip_md_inline(block["text"]), st))
        elif btype == "table":
            headers = [_strip_md_inline(h) for h in block["headers"]]
            rows = [[_strip_md_inline(c) for c in row] for row in block["rows"]]
            table_data = [headers] + rows

            cell_style = ParagraphStyle(
                "TableCell", parent=styles["Normal"],
                fontSize=9, leading=12, fontName="Helvetica",
            )
            header_style = ParagraphStyle(
                "TableHeader", parent=styles["Normal"],
                fontSize=9, leading=12, fontName="Helvetica-Bold",
                textColor=colors.white,
            )
            # Wrap cells in Paragraphs for text wrapping
            styled_data = [
                [Paragraph(cell, header_style) for cell in table_data[0]]
            ] + [
                [Paragraph(cell, cell_style) for cell in row]
                for row in table_data[1:]
            ]

            # Auto-distribute column widths across page width
            usable_width = 16 * cm  # A4 minus margins
            col_count = len(headers)
            col_w = [usable_width / col_count] * col_count

            tbl = RLTable(styled_data, colWidths=col_w, repeatRows=1)
            tbl.setStyle(RLTableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1D4ED8")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]))
            story.append(Spacer(1, 8))
            story.append(tbl)
            story.append(Spacer(1, 8))
        elif btype == "paragraph":
            clean = _strip_md_inline(block["text"])
            if clean:
                story.append(Paragraph(clean, body_style))
        elif btype == "bullet":
            clean = _strip_md_inline(block["text"])
            story.append(Paragraph(f"\u2022\u2002{clean}", bullet_style))
        elif btype == "code":
            code_text = block["text"].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            story.append(Preformatted(code_text, code_style))
        elif btype == "hr":
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#D1D5DB"), spaceAfter=8))
        elif btype == "spacer":
            story.append(Spacer(1, 6))

    doc.build(story)
    return buf.getvalue()


def generate_docx(content: str, title: str) -> bytes:
    if not DOCX_AVAILABLE:
        raise RuntimeError("python-docx tidak tersedia")

    doc = DocxDocument()

    # Page margins
    for section in doc.sections:
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)

    # Title
    title_para = doc.add_heading(title, level=0)
    title_para.runs[0].font.color.rgb = RGBColor(0x11, 0x11, 0x11)
    title_para.runs[0].font.size = Pt(20)

    blocks = _parse_markdown_blocks(content)
    for block in blocks:
        btype = block["type"]
        if btype == "heading":
            lvl = min(block["level"], 4)
            h = doc.add_heading(_strip_md_inline(block["text"]), level=lvl)
            if h.runs:
                if lvl == 1:
                    h.runs[0].font.color.rgb = RGBColor(0x11, 0x11, 0x11)
                elif lvl == 2:
                    h.runs[0].font.color.rgb = RGBColor(0x1D, 0x4E, 0xD8)
        elif btype == "table":
            from docx.oxml.ns import qn
            from docx.oxml import OxmlElement
            headers = block["headers"]
            rows = block["rows"]
            col_count = len(headers)
            tbl = doc.add_table(rows=1 + len(rows), cols=col_count)
            tbl.style = "Table Grid"
            # Header row
            hdr_row = tbl.rows[0]
            for j, cell_text in enumerate(headers):
                cell = hdr_row.cells[j]
                cell.text = _strip_md_inline(cell_text)
                run = cell.paragraphs[0].runs[0]
                run.font.bold = True
                run.font.size = Pt(9)
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                # Blue background
                tc = cell._tc
                tcPr = tc.get_or_add_tcPr()
                shd = OxmlElement("w:shd")
                shd.set(qn("w:fill"), "1D4ED8")
                shd.set(qn("w:color"), "auto")
                shd.set(qn("w:val"), "clear")
                tcPr.append(shd)
            # Data rows
            for ri, row_data in enumerate(rows):
                tbl_row = tbl.rows[ri + 1]
                fill = "F9FAFB" if ri % 2 == 1 else "FFFFFF"
                for j, cell_text in enumerate(row_data[:col_count]):
                    cell = tbl_row.cells[j]
                    cell.text = _strip_md_inline(cell_text)
                    run = cell.paragraphs[0].runs[0] if cell.paragraphs[0].runs else cell.paragraphs[0].add_run()
                    run.font.size = Pt(9)
                    tc = cell._tc
                    tcPr = tc.get_or_add_tcPr()
                    shd = OxmlElement("w:shd")
                    shd.set(qn("w:fill"), fill)
                    shd.set(qn("w:color"), "auto")
                    shd.set(qn("w:val"), "clear")
                    tcPr.append(shd)
            doc.add_paragraph()  # spacer after table
        elif btype == "paragraph":
            clean = _strip_md_inline(block["text"])
            if clean:
                p = doc.add_paragraph(clean)
                p.paragraph_format.space_after = Pt(6)
        elif btype == "bullet":
            doc.add_paragraph(_strip_md_inline(block["text"]), style="List Bullet")
        elif btype == "code":
            p = doc.add_paragraph(block["text"])
            p.style = doc.styles["No Spacing"]
            for run in p.runs:
                run.font.name = "Courier New"
                run.font.size = Pt(8)
                run.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
        elif btype == "hr":
            doc.add_paragraph("─" * 60)
        elif btype == "spacer":
            doc.add_paragraph()

    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# ── Image Generation ──────────────────────────────────────────────────────────

class ImageGenerateRequest(BaseModel):
    prompt: str

    @field_validator("prompt")
    @classmethod
    def trim_prompt(cls, v: str) -> str:
        return v.strip()


@api_router.post("/generate-image")
async def generate_image(req: ImageGenerateRequest):
    """Generate an image using flux-2-klein-4b via the configured provider."""
    base_url = env_str("OPENAI_BASE_URL")
    api_key = env_str("OPENAI_API_KEY")

    if not base_url or not api_key:
        return JSONResponse(
            {"error": "Provider belum dikonfigurasi. Set OPENAI_BASE_URL dan OPENAI_API_KEY."},
            status_code=500,
        )

    # Build image generation URL — strip /chat/completions suffix if present
    clean_base = base_url.rstrip("/")
    if clean_base.endswith("/chat/completions"):
        clean_base = clean_base[: -len("/chat/completions")]
    image_url = f"{clean_base}/images/generations"

    payload = {
        "model": IMAGE_MODEL_ID,
        "prompt": req.prompt,
        "n": 1,
        "size": "1024x1024",
        "response_format": "url",
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    timeout = env_float("OPENAI_TIMEOUT_SECONDS", DEFAULT_TIMEOUT_SECONDS)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(image_url, headers=headers, json=payload)
            if response.status_code >= 400:
                detail = response.text[:MAX_PROVIDER_ERROR_CHARS]
                logger.warning("Image generation error %s: %s", response.status_code, detail)
                return JSONResponse(
                    {"error": f"Provider error {response.status_code}: {detail}"},
                    status_code=response.status_code,
                )
            data = response.json()
            image_url_result = (
                data.get("data", [{}])[0].get("url")
                or data.get("data", [{}])[0].get("b64_json")
            )
            if not image_url_result:
                return JSONResponse({"error": "Tidak ada gambar dalam respons provider"}, status_code=500)

            # If b64_json, prefix with data URI
            if not image_url_result.startswith("http"):
                image_url_result = f"data:image/png;base64,{image_url_result}"

            return JSONResponse({"success": True, "image_url": image_url_result, "prompt": req.prompt})
    except httpx.TimeoutException:
        return JSONResponse({"error": "Request timeout saat generate gambar"}, status_code=504)
    except Exception as exc:
        logger.exception("Image generation failed")
        return JSONResponse({"error": f"Gagal generate gambar: {exc}"}, status_code=500)


@api_router.post("/generate-document")
async def generate_document(req: DocumentRequest):
    """Generate a downloadable document (PDF, DOCX, TXT, MD) from AI response text."""
    fmt = req.format.lower()
    safe_title = re.sub(r'[^\w\s-]', '', req.title).strip().replace(" ", "-")[:60] or "document"

    try:
        if fmt == "pdf":
            data = generate_pdf(req.content, req.title)
            return StreamingResponse(
                io.BytesIO(data),
                media_type="application/pdf",
                headers={"Content-Disposition": f'attachment; filename="{safe_title}.pdf"'},
            )

        elif fmt == "docx":
            data = generate_docx(req.content, req.title)
            return StreamingResponse(
                io.BytesIO(data),
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": f'attachment; filename="{safe_title}.docx"'},
            )

        elif fmt == "txt":
            # Strip markdown formatting for plain text
            plain = re.sub(r'```[\s\S]*?```', lambda m: m.group(0).split("\n", 1)[-1].rsplit("\n", 1)[0], req.content)
            plain = re.sub(r'#{1,6}\s*', '', plain)
            plain = re.sub(r'[\*_`]', '', plain)
            plain = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', plain)
            header = f"{req.title}\n{'=' * len(req.title)}\nGenerated by MicroAgent · {datetime.now(timezone.utc).strftime('%d %B %Y')}\n\n"
            data = (header + plain).encode("utf-8")
            return StreamingResponse(
                io.BytesIO(data),
                media_type="text/plain; charset=utf-8",
                headers={"Content-Disposition": f'attachment; filename="{safe_title}.txt"'},
            )

        elif fmt == "md":
            header = f"# {req.title}\n\n> Generated by MicroAgent · {datetime.now(timezone.utc).strftime('%d %B %Y')}\n\n---\n\n"
            data = (header + req.content).encode("utf-8")
            return StreamingResponse(
                io.BytesIO(data),
                media_type="text/markdown; charset=utf-8",
                headers={"Content-Disposition": f'attachment; filename="{safe_title}.md"'},
            )

        else:
            return JSONResponse({"error": f"Format '{fmt}' tidak didukung"}, status_code=400)

    except RuntimeError as exc:
        logger.error("Document generation failed: %s", exc)
        return JSONResponse({"error": str(exc)}, status_code=500)
    except Exception as exc:
        logger.exception("Unexpected error in generate_document")
        return JSONResponse({"error": "Terjadi kesalahan saat membuat dokumen"}, status_code=500)


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
        except RuntimeError as exc:
            logger.warning("Web search not configured: %s", exc)
            yield sse(
                "status",
                {
                    "phase": "web_search",
                    "provider": provider,
                    "status": "failed",
                    "message": str(exc),
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
                    "message": f"Pencarian web gagal: {exc}",
                },
            )

    # If both web_search and reasoning are enabled, disable reasoning during web search
    # so model focuses entirely on synthesizing web context first.
    # Reasoning is still sent to provider but web context is always fully injected first.
    # (web_context is already built before stream_provider is called — order is correct)
    for event in stream_provider(payload, web_context=web_context):
        yield event


# ── Improve Prompt ─────────────────────────────────────────────────────────

IMPROVE_SYSTEM = """\
Kamu adalah pakar prompt engineering. Tugasmu menulis ulang prompt pengguna 
menjadi lebih jelas, spesifik, dan efektif.

ATURAN:
- Pertahankan bahasa yang sama (Indonesia \u2192 Indonesia, English \u2192 English)
- Pertahankan maksud yang sama \u2014 jangan ubah apa yang diinginkan user
- Tambahkan spesifisitas: siapa, apa, format, tone, panjang jika hilang
- Hilangkan ambiguitas
- Buat actionable dan jelas
- Tetap ringkas \u2014 jangan terlalu panjang
- Output HANYA teks prompt yang sudah diperbaiki
- Tanpa penjelasan, tanpa kata pembuka, langsung teksnya saja
"""


class ImprovePromptRequest(BaseModel):
    prompt: str
    context: str = ""

    @field_validator("prompt")
    @classmethod
    def trim_prompt(cls, v: str) -> str:
        return v.strip()


@api_router.post("/improve-prompt")
async def improve_prompt(req: ImprovePromptRequest):
    if len(req.prompt) < 3:
        return JSONResponse({"success": False, "error": "Prompt terlalu pendek"}, status_code=400)

    base_url = env_str("OPENAI_BASE_URL")
    api_key = env_str("OPENAI_API_KEY")
    if not base_url or not api_key:
        return JSONResponse({"success": False, "error": "Provider belum dikonfigurasi"}, status_code=500)

    model = MODEL_ID_TO_PROVIDER.get(DEFAULT_MODEL_ID, DEFAULT_MODEL_ID)
    context_text = f"\n\nKonteks percakapan:\n{req.context.strip()}" if req.context.strip() else ""
    user_content = f"Improve this prompt:{context_text}\n\nOriginal: {req.prompt}"

    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": IMPROVE_SYSTEM},
            {"role": "user", "content": user_content},
        ],
        "max_tokens": 1024,
        "temperature": 0.4,
        "stream": True,
    }
    headers_req = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    timeout = httpx.Timeout(connect=15.0, read=60.0, write=15.0, pool=15.0)

    try:
        improved = ""
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream("POST", provider_url(base_url), headers=headers_req, json=body) as resp:
                if resp.status_code >= 400:
                    detail = await resp.aread()
                    return JSONResponse({"success": False, "error": f"Model error {resp.status_code}: {detail[:200].decode(errors='replace')}"}, status_code=500)
                async for line in resp.aiter_lines():
                    line = line.strip()
                    if line.startswith("data:"):
                        line = line[5:].strip()
                    if not line or line == "[DONE]":
                        continue
                    try:
                        chunk = json.loads(line)
                        delta = chunk["choices"][0].get("delta", {})
                        improved += delta.get("content") or ""
                    except (json.JSONDecodeError, KeyError, IndexError):
                        pass
        return JSONResponse({"success": True, "original": req.prompt, "improved": improved.strip()})
    except Exception as exc:
        logger.exception("Improve prompt failed")
        return JSONResponse({"success": False, "error": str(exc)}, status_code=500)


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


# ── Deep Research ────────────────────────────────────────────────────────

try:
    from duckduckgo_search import DDGS as _DDGS
    DDGS_AVAILABLE = True
except ImportError:
    DDGS_AVAILABLE = False

try:
    from bs4 import BeautifulSoup as _BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False


class DeepResearchRequest(BaseModel):
    query: str

    @field_validator("query")
    @classmethod
    def trim_query(cls, v: str) -> str:
        return v.strip()


DEEP_RESEARCH_SYSTEM = """\
Kamu adalah analis riset mendalam. Tugasmu adalah mensintesis informasi dari berbagai sumber web
menjadi laporan komprehensif dalam Bahasa Indonesia.

Kamu akan diberikan hasil pencarian web. Tugasmu:
1. Analisis semua informasi yang diberikan
2. Identifikasi tema utama, tren, dan insight penting
3. Tulis laporan terstruktur yang komprehensif
4. Sertakan sitasi [1],[2] dst. di akhir

Format laporan:
## [Judul Laporan]

### Ringkasan Eksekutif
...

### Temuan Utama
...

### Analisis Detail
...

### Kesimpulan
...

### Referensi
[1] judul - domain.com
[2] ...
"""


async def _ddg_search(query: str, max_results: int = 8) -> List[dict]:
    if not DDGS_AVAILABLE:
        return [{"error": "duckduckgo-search tidak tersedia"}]
    try:
        import asyncio
        loop = asyncio.get_event_loop()
        def _sync():
            with _DDGS() as ddgs:
                return list(ddgs.text(query, max_results=max_results))
        results = await loop.run_in_executor(None, _sync)
        return [
            {"title": r.get("title", ""), "url": r.get("href", ""), "snippet": r.get("body", "")}
            for r in results
        ]
    except Exception as exc:
        logger.warning("DDG search failed: %s", exc)
        return [{"error": str(exc)}]


async def _fetch_url(url: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            if not BS4_AVAILABLE:
                return resp.text[:4000]
            soup = _BeautifulSoup(resp.text, "html.parser")
            for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
                tag.decompose()
            text = soup.get_text(separator="\n", strip=True)
            # Compact whitespace
            text = "\n".join(line for line in text.splitlines() if line.strip())
            return text[:5000]
    except Exception as exc:
        return f"Error fetching {url}: {exc}"


async def run_deep_research(query: str):
    """
    Deep research flow:
    1. Generate 5 search queries from the topic
    2. Execute each query via Tavily/Firecrawl/DDG
    3. Fetch top URLs via Firecrawl or direct HTTP
    4. Synthesize all content into a report via model
    """
    import time
    start_time = time.time()

    def evt(data: dict) -> str:
        return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

    base_url = env_str("OPENAI_BASE_URL")
    api_key = env_str("OPENAI_API_KEY")
    if not base_url or not api_key:
        yield evt({"type": "error", "message": "Provider belum dikonfigurasi"})
        return

    model = MODEL_ID_TO_PROVIDER.get(DEFAULT_MODEL_ID, DEFAULT_MODEL_ID)
    timeout_obj = httpx.Timeout(connect=15.0, read=180.0, write=30.0, pool=15.0)
    headers_req = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    yield evt({"type": "start", "message": "Memulai riset mendalam...", "query": query})

    # ── STEP 1: Generate search queries ──────────────────────────────────────
    async def call_model(msgs: list, max_tok: int = 3000) -> str:
        body = {"model": model, "messages": msgs, "temperature": 0.3, "max_tokens": max_tok, "stream": True}
        full = ""
        async with httpx.AsyncClient(timeout=timeout_obj) as client:
            async with client.stream("POST", provider_url(base_url), headers=headers_req, json=body) as resp:
                if resp.status_code >= 400:
                    detail = await resp.aread()
                    raise RuntimeError(f"Model error {resp.status_code}: {detail[:300].decode(errors='replace')}")
                async for line in resp.aiter_lines():
                    line = line.strip()
                    if line.startswith("data:"):
                        line = line[5:].strip()
                    if not line or line == "[DONE]":
                        continue
                    try:
                        chunk = json.loads(line)
                        delta = chunk["choices"][0].get("delta", {})
                        full += delta.get("content") or ""
                    except (json.JSONDecodeError, KeyError, IndexError):
                        pass
        return full

    yield evt({"type": "step", "action": "search", "message": "Membuat rencana riset...", "step": 1})

    # Generate 10 diverse search queries
    try:
        query_response = await call_model([
            {"role": "system", "content": "Kamu adalah asisten riset. Jawab HANYA dengan JSON array berisi 10 query pencarian campuran bahasa Indonesia dan Inggris yang beragam untuk meneliti topik secara komprehensif dari berbagai sudut pandang."},
            {"role": "user", "content": f"Topik: {query}\n\nBerikan 10 query pencarian yang sangat beragam (definisi, tren, statistik, prediksi, contoh kasus, kritik, dll). Format: [\"query1\", \"query2\", ...]"},
        ], max_tok=500)
        import re as _re
        arr_match = _re.search(r'\[.*?\]', query_response, _re.DOTALL)
        search_queries = json.loads(arr_match.group(0)) if arr_match else [query]
        search_queries = [str(q) for q in search_queries[:10]]
    except Exception:
        search_queries = [
            query, f"{query} prediksi tren", f"{query} 2025 2026 2030",
            f"{query} analisis pasar", f"{query} statistik data",
            f"{query} riset terbaru", f"{query} impact dampak",
            f"{query} indonesia", f"{query} global worldwide",
            f"{query} future outlook",
        ]

    # ── STEP 2: Execute searches (max 50 results total) ────────────────────────
    all_results: List[dict] = []
    sources: List[dict] = []
    steps: List[str] = []
    max_search_results = 50  # max 50 web results total
    results_per_query = max(3, min(8, max_search_results // len(search_queries)))

    for i, q in enumerate(search_queries):
        if len(all_results) >= max_search_results:
            break
        step_msg = f"Mencari: {q}"
        steps.append(step_msg)
        yield evt({"type": "step", "action": "search", "message": step_msg, "step": len(steps)})

        try:
            _, results = await web_search(q, max_results=results_per_query)
        except Exception as exc:
            logger.warning("Deep research search failed for '%s': %s", q, exc)
            results = []

        for r in results:
            if r.get("url"):
                yield evt({"type": "source_found", "title": r.get("title", ""), "url": r["url"]})
        all_results.extend(results)

    yield evt({"type": "step", "action": "search", "message": f"Ditemukan {len(all_results)} hasil dari {len(search_queries)} query", "step": len(steps)})

    # ── STEP 3: Fetch top URLs ─────────────────────────────────────────────────
    seen_urls: set = set()
    urls_to_read: List[str] = []
    # Deduplicate and prioritize — take up to 15 URLs
    for r in all_results:
        url = r.get("url", "")
        if url and url not in seen_urls and not url.endswith(".pdf") and "youtube.com" not in url:
            seen_urls.add(url)
            urls_to_read.append(url)
        if len(urls_to_read) >= 15:
            break

    web_context_parts: List[str] = []
    for url in urls_to_read:
        step_msg = f"Membaca: {url}"
        steps.append(step_msg)
        yield evt({"type": "step", "action": "read", "message": step_msg, "step": len(steps), "url": url})

        content = await _fetch_url(url)
        title = next((r.get("title", url) for r in all_results if r.get("url") == url), url)
        sources.append({"url": url, "title": title})
        yield evt({"type": "source_added", "url": url, "title": title, "total": len(sources)})
        # Include more content per source for richer report
        web_context_parts.append(f"### [{i+1}] {title}\nURL: {url}\n\n{content[:3000]}")

    # ── STEP 3.5: Search images via Firecrawl or Tavily ──────────────────────
    image_step = "Mencari gambar relevan..."
    steps.append(image_step)
    yield evt({"type": "step", "action": "image", "message": image_step, "step": len(steps)})

    images: List[dict] = []  # [{url, alt, source_url}]
    image_query = f"{query} photo portrait"
    try:
        # Try Firecrawl search for images first (has image metadata)
        if env_str("FIRECRAWL_API_KEY"):
            fc_results = await firecrawl_search(image_query, max_results=5)
            for r in fc_results:
                # Extract image URLs from markdown content
                img_matches = re.findall(r'!\[([^\]]*)\]\((https?://[^)]+\.(?:jpg|jpeg|png|webp|gif)[^)]*)\)', r.get("content", ""))
                for alt, img_url in img_matches[:3]:
                    if img_url not in [im["url"] for im in images]:
                        images.append({"url": img_url, "alt": alt or query, "source_url": r.get("url", "")})
                if len(images) >= 6:
                    break
        # Fallback: try Tavily with images enabled
        if not images and env_str("TAVILY_API_KEY"):
            try:
                tv_payload = {
                    "api_key": env_str("TAVILY_API_KEY"),
                    "query": image_query,
                    "search_depth": "basic",
                    "max_results": 5,
                    "include_images": True,
                }
                async with httpx.AsyncClient(timeout=10) as client:
                    tv_resp = await client.post("https://api.tavily.com/search", json=tv_payload)
                    tv_data = tv_resp.json()
                for img_url in (tv_data.get("images") or [])[:6]:
                    images.append({"url": img_url, "alt": query, "source_url": ""})
            except Exception:
                pass
    except Exception as exc:
        logger.warning("Image search failed: %s", exc)

    if images:
        yield evt({"type": "images_found", "images": images[:6]})

    # ── STEP 4: Synthesize report ─────────────────────────────────────────────
    synth_step = f"Mensintesis {len(sources)} sumber menjadi laporan mendalam..."
    steps.append(synth_step)
    yield evt({"type": "step", "action": "synthesize", "message": synth_step, "step": len(steps)})

    context_text = "\n\n".join(web_context_parts)

    # Build clickable reference list with markdown links
    ref_list = "\n".join(
        f"[{i+1}] [{s['title']}]({s['url']})"
        for i, s in enumerate(sources)
    )

    # Build image context for model
    image_context = ""
    if images:
        image_context = "\n\nGambar yang tersedia untuk digunakan dalam laporan (gunakan format markdown ![alt](url)):\n"
        image_context += "\n".join(f"- ![{img['alt']}]({img['url']})" for img in images[:4])

    report_prompt = f"""Topik riset: {query}

Anda memiliki {len(sources)} sumber web berikut:

{context_text}
{image_context}
---
Daftar sumber lengkap:
{ref_list}

Tulis laporan riset KOMPREHENSIF dan MENDALAM dalam Bahasa Indonesia.
Laporan harus:
- Minimal 800-1200 kata
- Berstruktur dengan heading yang jelas
- Mencakup semua aspek penting dari data yang ada
- Menyertakan data, angka, dan fakta spesifik dari sumber
- Sitasi inline: gunakan format superscript link seperti ini: [judul sumber](url) atau cukup \u00b9[](url) \u00b2[](url) — JANGAN gunakan format [[1]](url)
- Sisipkan gambar yang relevan menggunakan markdown: ![deskripsi gambar](url_gambar) di dalam teks laporan
- Di akhir laporan, tambahkan bagian **## Referensi** dengan daftar:
  - [judul artikel](url)
  - [judul artikel](url)
- Berikan analisis dan insight, bukan sekadar ringkasan"""

    try:
        report = await call_model([
            {"role": "system", "content": DEEP_RESEARCH_SYSTEM},
            {"role": "user", "content": report_prompt},
        ], max_tok=16000)
    except RuntimeError as exc:
        yield evt({"type": "error", "message": str(exc)})
        return
    except Exception as exc:
        yield evt({"type": "error", "message": f"Gagal sintesis: {exc}"})
        return

    elapsed = round(time.time() - start_time)
    mins, secs = divmod(elapsed, 60)
    time_str = f"{mins}m {secs}s" if mins else f"{secs}s"

    yield evt({
        "type": "complete",
        "report": report,
        "sources": sources,
        "steps": len(steps),
        "elapsed": time_str,
    })


@api_router.post("/deep-research")
async def deep_research_endpoint(req: DeepResearchRequest):
    return StreamingResponse(
        run_deep_research(req.query),
        media_type="text/event-stream; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── File Upload & Document Analysis ──────────────────────────────────────────

try:
    from PyPDF2 import PdfReader as _PdfReader
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "pdf", "docx", "xlsx", "xls", "txt", "csv", "md"}


async def extract_file_content(file_bytes: bytes, filename: str, content_type: str) -> dict:
    """Extract content from uploaded file. Returns a dict with type and content."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    # Images — send as base64 to provider
    if ext in {"jpg", "jpeg", "png", "gif", "webp"} or "image" in content_type:
        import base64
        media_map = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
                     "gif": "image/gif", "webp": "image/webp"}
        media_type = media_map.get(ext, "image/jpeg")
        b64 = base64.standard_b64encode(file_bytes).decode()
        return {"kind": "image", "media_type": media_type, "b64": b64, "filename": filename}

    # PDF — extract text via PyPDF2
    if ext == "pdf":
        if PYPDF2_AVAILABLE:
            try:
                import io
                reader = _PdfReader(io.BytesIO(file_bytes))
                pages = []
                for page in reader.pages[:30]:  # max 30 pages
                    text = page.extract_text() or ""
                    if text.strip():
                        pages.append(text)
                text = "\n\n".join(pages)[:15000]
                return {"kind": "text", "text": f"[PDF: {filename}]\n\n{text}", "filename": filename}
            except Exception as exc:
                return {"kind": "text", "text": f"[PDF: {filename}] (gagal ekstrak: {exc})", "filename": filename}
        return {"kind": "text", "text": f"[PDF: {filename}] (PyPDF2 tidak tersedia)", "filename": filename}

    # DOCX
    if ext == "docx" and DOCX_AVAILABLE:
        try:
            import io
            doc = DocxDocument(io.BytesIO(file_bytes))
            text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())[:15000]
            return {"kind": "text", "text": f"[Word: {filename}]\n\n{text}", "filename": filename}
        except Exception as exc:
            return {"kind": "text", "text": f"[Word: {filename}] (gagal ekstrak: {exc})", "filename": filename}

    # XLSX / XLS
    if ext in {"xlsx", "xls"}:
        try:
            import openpyxl, io
            wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
            rows_text = []
            for sheet_name in wb.sheetnames[:5]:
                ws = wb[sheet_name]
                rows_text.append(f"=== Sheet: {sheet_name} ===")
                for row in ws.iter_rows(values_only=True):
                    row_str = " | ".join(str(c) if c is not None else "" for c in row)
                    if row_str.replace(" | ", "").strip():
                        rows_text.append(row_str)
                if len("\n".join(rows_text)) > 12000:
                    break
            text = "\n".join(rows_text)[:15000]
            return {"kind": "text", "text": f"[Excel: {filename}]\n\n{text}", "filename": filename}
        except Exception as exc:
            return {"kind": "text", "text": f"[Excel: {filename}] (gagal ekstrak: {exc})", "filename": filename}

    # TXT / CSV / MD
    if ext in {"txt", "csv", "md"}:
        text = file_bytes.decode("utf-8", errors="ignore")[:15000]
        return {"kind": "text", "text": f"[{ext.upper()}: {filename}]\n\n{text}", "filename": filename}

    # Fallback
    text = file_bytes.decode("utf-8", errors="ignore")[:5000]
    return {"kind": "text", "text": f"[{filename}]\n\n{text}", "filename": filename}


from fastapi import UploadFile, File, Form


@api_router.post("/upload-and-analyze")
async def upload_and_analyze(
    files: List[UploadFile] = File(...),
    prompt: str = Form(default="Tolong analisis file yang saya upload."),
    chat_history: str = Form(default="[]"),
):
    """Analyze uploaded files (images, PDF, DOCX, XLSX, TXT) using the AI model."""
    base_url = env_str("OPENAI_BASE_URL")
    api_key = env_str("OPENAI_API_KEY")
    if not base_url or not api_key:
        return JSONResponse({"error": "Provider belum dikonfigurasi"}, status_code=500)

    # Validate and process files
    file_texts: List[str] = []
    image_blocks: List[dict] = []
    filenames: List[str] = []

    for upload in files[:5]:  # max 5 files
        file_bytes = await upload.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            return JSONResponse({"error": f"File {upload.filename} terlalu besar (maks 10MB)"}, status_code=400)

        content_type = upload.content_type or ""
        result = await extract_file_content(file_bytes, upload.filename or "file", content_type)
        filenames.append(upload.filename or "file")

        if result["kind"] == "image":
            image_blocks.append(result)
        else:
            file_texts.append(result["text"])

    # Build message content for the provider
    # Use text-only format (OpenAI-compatible) — images as text descriptions
    content_parts = []

    for img in image_blocks:
        # Send as OpenAI vision format
        content_parts.append({
            "type": "image_url",
            "image_url": {"url": f"data:{img['media_type']};base64,{img['b64']}"}
        })
        content_parts.append({"type": "text", "text": f"[Gambar: {img['filename']}]"})

    for txt in file_texts:
        content_parts.append({"type": "text", "text": txt})

    content_parts.append({
        "type": "text",
        "text": prompt if prompt.strip() else "Tolong analisis file yang saya upload."
    })

    # Parse chat history
    try:
        history = json.loads(chat_history)
        if not isinstance(history, list):
            history = []
    except Exception:
        history = []

    model = MODEL_ID_TO_PROVIDER.get(DEFAULT_MODEL_ID, DEFAULT_MODEL_ID)
    timeout = env_float("OPENAI_TIMEOUT_SECONDS", DEFAULT_TIMEOUT_SECONDS)
    headers_req = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    messages = history[-6:] + [{"role": "user", "content": content_parts}]
    body = {
        "model": model,
        "messages": messages,
        "max_tokens": 4096,
        "temperature": 0.7,
        "stream": False,
    }
    system_msg = (
        "Kamu adalah asisten AI yang ahli menganalisis dokumen dan gambar. "
        "Baca dan pahami seluruh isi file yang diberikan. "
        "Jawab pertanyaan user berdasarkan isi file. "
        "Jika tidak ada pertanyaan spesifik, berikan ringkasan komprehensif. "
        "Untuk gambar: deskripsikan apa yang kamu lihat secara detail. "
        "Untuk data/excel: identifikasi pola, trend, dan insight penting. "
        "Untuk dokumen: ringkas poin-poin utama. "
        "Selalu respond dalam bahasa yang sama dengan pertanyaan user."
    )
    # Prepend system message
    messages = [{"role": "system", "content": system_msg}] + messages
    body["messages"] = messages

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(provider_url(base_url), headers=headers_req, json=body)
            if resp.status_code >= 400:
                detail = resp.text[:500]
                return JSONResponse({"error": f"Model error {resp.status_code}: {detail}"}, status_code=500)
            data = resp.json()
        response_text = data["choices"][0]["message"]["content"] or ""
    except Exception as exc:
        return JSONResponse({"error": f"Gagal analisis: {exc}"}, status_code=500)

    return JSONResponse({
        "success": True,
        "response": response_text,
        "files_analyzed": filenames,
    })


app.include_router(api_router)

origins = cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_credentials="*" not in origins,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

