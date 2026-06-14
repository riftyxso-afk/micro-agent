"""
Smoke test: send a chat request to the local server and print SSE events.

Usage:
    python backend/smoke_stream.py

Defaults to http://127.0.0.1:8001; override SERVER_URL env for custom port/host.
Defaults to first model in MODEL_ID_TO_PROVIDER; override MODEL_ID env.
"""

import json
import os
import sys

import requests

SERVER_URL = os.environ.get("SERVER_URL", "http://127.0.0.1:8001").rstrip("/")
MODEL_ID = os.environ.get("MODEL_ID", "claude-sonnet-4-5")

body = {
    "messages": [{"role": "user", "content": "Say hello in one short sentence."}],
    "model_id": MODEL_ID,
    "auto_mode": False,
    "room": "Chat Room",
    "attachments": [],
}

url = f"{SERVER_URL}/api/chat/stream"
print(f"POST {url}  model={MODEL_ID}")
print("-" * 50)

try:
    r = requests.post(url, json=body, stream=True, timeout=30)
except requests.RequestException as exc:
    print(f"Request failed: {exc}")
    sys.exit(1)

print(f"Status: {r.status_code}")
if r.status_code >= 400:
    print(r.text[:500])
    sys.exit(1)

for line in r.iter_lines(decode_unicode=True):
    if line:
        print(line)
