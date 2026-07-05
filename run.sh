#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "━━━ MicroAgent — Local Dev ━━━"

# ── Backend ─────────────────────────────────────────────────
echo ""
echo "→ Setting up backend..."

if [ ! -f "$ROOT/backend/.env" ] && [ -f "$ROOT/backend/.env.example" ]; then
  cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
  echo "  ⚠ Created backend/.env from example — edit it with real keys"
fi

PYTHON=$(command -v python3 || command -v python || echo "")
if [ -z "$PYTHON" ]; then
  echo "  ⚠ Python not found (tried python3, python)"
  exit 1
fi

echo "  Installing deps..."
"$PYTHON" -m pip install -r "$ROOT/backend/requirements.txt" -q 2>/dev/null

echo "  Starting backend → http://127.0.0.1:8001"
(cd "$ROOT/backend" && "$PYTHON" server.py) &
BACKEND_PID=$!
sleep 2

# ── Frontend ────────────────────────────────────────────────
echo ""
echo "→ Setting up frontend..."

if [ ! -f "$ROOT/frontend/.env" ] && [ -f "$ROOT/frontend/.env.example" ]; then
  cp "$ROOT/frontend/.env.example" "$ROOT/frontend/.env"
fi

echo "  Installing deps..."
npm install --legacy-peer-deps --silent --prefix "$ROOT/frontend" 2>/dev/null

echo "  Starting frontend → http://localhost:3000"
BROWSER=none npm start --prefix "$ROOT/frontend" &
FRONTEND_PID=$!

echo ""
echo "━━━ Running ━━━"
echo "  Frontend → http://localhost:3000"
echo "  Backend  → http://127.0.0.1:8001"
echo "  API docs → http://127.0.0.1:8001/docs"
echo "  Press Ctrl+C to stop both"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━"

cleanup() {
  echo ""
  echo "→ Stopping..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait 2>/dev/null
  echo "  Done."
}
trap cleanup INT TERM
wait
