"""
Quick script: fetch available models from OPENAI_BASE_URL /models endpoint.

Usage:
    python backend/check_models.py
"""

import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

env_path = Path(__file__).parent / ".env"
if not env_path.exists():
    print("Error: backend/.env not found")
    sys.exit(1)

load_dotenv(env_path)
import os  # noqa: E402

base_url = os.environ.get("OPENAI_BASE_URL", "").rstrip("/")
api_key = os.environ.get("OPENAI_API_KEY", "")

if not base_url:
    print("Error: OPENAI_BASE_URL is not set in .env")
    sys.exit(1)
if not api_key:
    print("Error: OPENAI_API_KEY is not set in .env")
    sys.exit(1)

model_url = base_url + "/models"
print(f"Fetching models from: {model_url}")

try:
    r = requests.get(
        model_url,
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=30,
    )
except requests.RequestException as exc:
    print(f"Request failed: {exc}")
    sys.exit(1)

print(f"Status: {r.status_code}")

if r.ok:
    try:
        data = r.json()
    except ValueError as exc:
        print(f"Invalid JSON response: {exc}")
        sys.exit(1)
    models = data.get("data", [])
    for m in models:
        print(f"  {m.get('id')}")
    print(f"\nTotal: {len(models)} models")
else:
    print(r.text[:1000])
