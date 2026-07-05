"""
FastAPI SSE endpoint buat generate landing page dengan live streaming.

Cara kerja:
1. Client POST prompt ke /api/generate
2. Server call OpenAI-compatible API dengan stream=True
3. Tiap token yang masuk di-feed ke IncrementalParser
4. Event terparsing (file_start, file_chunk, file_complete) langsung
   di-forward ke client via SSE — client update WebContainers real-time

Run: uvicorn builder.main:app --reload --port 8002
"""

import json
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from openai import OpenAI

from builder.stream_parser import IncrementalParser, EventType
from builder.system_prompts import (
    SYSTEM_PROMPT_GENERATE,
    SYSTEM_PROMPT_REVISE,
    build_revise_context,
)

app = FastAPI(title="Builder API")

_cors_origins = os.environ.get("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    base_url=os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    timeout=float(os.environ.get("OPENAI_TIMEOUT_SECONDS", "120")),
)

_MODEL = os.environ.get("OPENAI_MODEL", "claude-sonnet-4.6")
_MAX_TOKENS = int(os.environ.get("OPENAI_MAX_TOKENS", "8000"))
_executor = ThreadPoolExecutor(max_workers=4)


class GenerateRequest(BaseModel):
    prompt: str
    file_tree: dict[str, str] | None = None


def sse_format(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@app.post("/api/generate")
async def generate(req: GenerateRequest):
    async def event_stream():
        loop = asyncio.get_event_loop()
        queue: asyncio.Queue = asyncio.Queue()

        is_revise = bool(req.file_tree)

        if is_revise:
            system_prompt = SYSTEM_PROMPT_REVISE
            context = build_revise_context(req.file_tree)
            user_message = f"{context}\n\nInstruksi revisi: {req.prompt}"
            yield sse_format("status", {"message": "Membaca project existing..."})
        else:
            system_prompt = SYSTEM_PROMPT_GENERATE
            user_message = req.prompt
            yield sse_format("status", {"message": "Menghubungkan ke model..."})

        def run_stream():
            """Run blocking OpenAI stream in thread, push events to queue."""
            try:
                parser = IncrementalParser()
                stream = client.chat.completions.create(
                    model=_MODEL,
                    max_tokens=_MAX_TOKENS,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    stream=True,
                )
                # Signal generating started
                loop.call_soon_threadsafe(
                    queue.put_nowait, sse_format("status", {"message": "Generating..."})
                )
                for chunk in stream:
                    delta = chunk.choices[0].delta if chunk.choices else None
                    text_chunk = delta.content if delta and delta.content else ""
                    if not text_chunk:
                        continue
                    events = parser.feed(text_chunk)
                    for ev in events:
                        if ev.type == EventType.FILE_START:
                            msg = sse_format("file_start", {"path": ev.path})
                        elif ev.type == EventType.FILE_CHUNK:
                            msg = sse_format("file_chunk", {"path": ev.path, "content": ev.content})
                        elif ev.type == EventType.FILE_COMPLETE:
                            msg = sse_format("file_complete", {"path": ev.path})
                        elif ev.type == EventType.THINKING:
                            msg = sse_format("thinking", {"content": ev.content})
                        else:
                            continue
                        loop.call_soon_threadsafe(queue.put_nowait, msg)
                loop.call_soon_threadsafe(
                    queue.put_nowait, sse_format("done", {"message": "Generation selesai"})
                )
            except Exception as e:
                loop.call_soon_threadsafe(
                    queue.put_nowait, sse_format("error", {"message": str(e)})
                )
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, None)  # sentinel

        # Start blocking stream in thread pool
        loop.run_in_executor(_executor, run_stream)

        # Drain queue as events arrive
        while True:
            item = await queue.get()
            if item is None:
                break
            yield item

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/health")
async def health():
    return {"status": "ok", "model": _MODEL}
