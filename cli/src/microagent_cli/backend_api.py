import json
import os
import sys
import httpx
from typing import Optional


def _env(key: str, default: str = "") -> str:
    return os.environ.get(key, "").strip() or default


def stream_chat(messages: list[dict], model_id: str = None, max_tokens: int = 4096):
    base_url = _env("API_BASE_URL", "http://localhost:8001")
    api_url = f"{base_url.rstrip('/')}/api/chat/stream"

    body = {
        "messages": messages,
        "model_id": model_id or _env("OPENAI_MODEL", "deepseek-v4-flash"),
        "auto_mode": False,
        "reasoning": False,
        "effort_level": "max",
        "web_search": False,
        "user_id": "cli-user",
    }

    with httpx.Client(timeout=120) as client:
        with client.stream("POST", api_url, json=body) as resp:
            if resp.status_code >= 400:
                detail = resp.read().decode()[:500]
                raise RuntimeError(f"Backend error {resp.status_code}: {detail}")

            event = ""
            data = ""
            for line in resp.iter_lines():
                if not line:
                    continue
                line = line.strip()

                if line.startswith("event:"):
                    event = line[6:].strip()
                elif line.startswith("data:"):
                    data = line[5:].strip()
                    if event == "token":
                        try:
                            d = json.loads(data)
                            yield d.get("text", "")
                        except json.JSONDecodeError:
                            pass
                    elif event == "error":
                        try:
                            d = json.loads(data)
                            yield f"\n[Error: {d.get('message', 'unknown')}]"
                        except json.JSONDecodeError:
                            yield f"\n[Error: {data}]"
                        return
                    elif event == "done":
                        return
                    elif event == "reasoning" and _env("SHOW_REASONING"):
                        try:
                            d = json.loads(data)
                            yield f"\n[reasoning: {d.get('text', '')}]"
                        except json.JSONDecodeError:
                            pass
                elif line.startswith("data:"):
                    data = line[5:].strip()
