import json
import os
import sys
import httpx
from typing import Optional


def _env_str(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def _provider_url() -> str:
    clean = _env_str("OPENAI_BASE_URL").rstrip("/")
    if clean.endswith("/chat/completions"):
        return clean
    return f"{clean}/chat/completions"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {_env_str('OPENAI_API_KEY')}",
        "Content-Type": "application/json",
    }


def stream_chat(messages: list[dict], max_tokens: int = 4096):
    if not _env_str("OPENAI_BASE_URL") or not _env_str("OPENAI_API_KEY"):
        print("ERROR: Set OPENAI_BASE_URL and OPENAI_API_KEY in .env or environment", file=sys.stderr)
        sys.exit(1)

    model = _env_str("OPENAI_MODEL", "deepseek-v4-flash")
    timeout = float(_env_str("OPENAI_TIMEOUT_SECONDS", "120"))

    body = {
        "model": model,
        "messages": messages,
        "stream": True,
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }

    with httpx.Client(timeout=timeout) as client:
        with client.stream("POST", _provider_url(), json=body, headers=_headers()) as resp:
            if resp.status_code >= 400:
                detail = resp.read().decode()[:500]
                raise RuntimeError(f"API error {resp.status_code}: {detail}")

            for line in resp.iter_lines():
                if not line:
                    continue
                line = line.strip()
                if line.startswith("data:"):
                    line = line[5:].strip()
                if line == "[DONE]":
                    break
                try:
                    chunk = json.loads(line)
                    choices = chunk.get("choices", [])
                    if not choices:
                        continue
                    delta = choices[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        yield content
                except json.JSONDecodeError:
                    continue
