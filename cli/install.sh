#!/usr/bin/env bash
set -euo pipefail

REPO="${MICROAGENT_REPO:-https://github.com/riftyxso-afk/micro-agent}"
BRANCH="${MICROAGENT_BRANCH:-main}"
DIR="microagent-cli"
LOCAL="${MICROAGENT_LOCAL:-}"

# --local flag
for arg in "$@"; do
    [ "$arg" = "--local" ] && LOCAL="1"
done

BOLD='\033[1m'
DIM='\033[2m'
CYAN='\033[1;36m'
GREEN='\033[1;32m'
RED='\033[1;31m'
NC='\033[0m'

echo "${CYAN}"
echo "  ┌────────────────────────────────────┐"
echo "  │      MicroAgent CLI Installer      │"
echo "  └────────────────────────────────────┘"
echo "${NC}"

# ── check python ──
PY=""
for cmd in python3 python; do
    if command -v "$cmd" &>/dev/null; then
        ver=$("$cmd" --version 2>&1 | grep -oP '\d+\.\d+')
        major="${ver%.*}"
        minor="${ver#*.}"
        if [ "$major" -ge 3 ] && [ "$minor" -ge 10 ]; then
            PY="$cmd"
            break
        fi
    fi
done

if [ -z "$PY" ]; then
    echo "  ${RED}✗${NC} Python 3.10+ required. Install it first:"
    echo "    brew install python3        # macOS"
    echo "    sudo apt install python3     # Linux"
    echo "    https://python.org/downloads # Windows"
    exit 1
fi
echo "  ${GREEN}✓${NC} Python: $($PY --version)"

# ── check pip ──
PIP=""
for cmd in pip3 pip; do
    if command -v "$cmd" &>/dev/null; then
        PIP="$cmd"
        break
    fi
done
if [ -z "$PIP" ]; then
    echo "  ${RED}✗${NC} pip not found. Run: $PY -m ensurepip --upgrade"
    exit 1
fi
echo "  ${GREEN}✓${NC} pip: $($PIP --version | head -1)"

# ── detect OS ──
OS="$(uname -s)"
case "$OS" in
    Linux*)   OS="linux"   ;;
    Darwin*)  OS="macos"   ;;
    MINGW*|MSYS*|CYGWIN*) OS="windows" ;;
    *)        OS="unknown" ;;
esac
ARCH="$(uname -m)"
echo "  ${GREEN}✓${NC} OS: $OS ($ARCH)"

# ── source ──
if [ -n "$LOCAL" ] || [ -d "$(dirname "$0")" ]; then
    # Local install (dev mode)
    CLI_DIR="$(cd "$(dirname "$0")" && pwd)"
    echo "  ${GREEN}✓${NC} Using local source: $CLI_DIR"
else
    # Remote install from GitHub
    TMP=$(mktemp -d)
    cd "$TMP"
    echo ""
    echo "  ${CYAN}µ${NC} Downloading MicroAgent CLI..."

    if command -v git &>/dev/null; then
        git clone --depth 1 --branch "$BRANCH" "$REPO" "$DIR" 2>/dev/null || {
            echo "  ${RED}✗${NC} Git clone failed. Trying archive download..."
            rm -rf "$DIR" 2>/dev/null
            curl -fsSL "${REPO}/archive/refs/heads/${BRANCH}.tar.gz" | tar xz
            mv micro-agent-* "$DIR" 2>/dev/null || true
        }
    else
        curl -fsSL "${REPO}/archive/refs/heads/${BRANCH}.tar.gz" | tar xz
        mv micro-agent-* "$DIR" 2>/dev/null || true
    fi

    CLI_DIR="$TMP/$DIR/Micro-Agent-CLI"
    if [ ! -d "$CLI_DIR" ]; then
        echo "  ${RED}✗${NC} Could not download from $REPO"
        echo ""
        echo "  ${BOLD}Install from local source instead:${NC}"
        echo "    git clone https://github.com/riftyxso-afk/micro-agent.git"
        echo "    cd micro-agent/cli"
        echo "    bash install.sh --local"
        echo ""
        echo "  Or install directly with pip:"
        echo "    cd Micro-Agent-CLI && pip install -e ."
        exit 1
    fi
fi

cd "$CLI_DIR"

# ── install ──
echo "  ${CYAN}µ${NC} Installing dependencies..."
$PIP install --quiet --upgrade pip 2>/dev/null || true
$PIP install --quiet rich textual httpx prompt-toolkit 2>/dev/null

echo "  ${CYAN}µ${NC} Installing microagent-cli..."
$PIP install --quiet -e . 2>/dev/null

# ── done ──
echo ""
echo "  ${GREEN}✓${NC} MicroAgent CLI installed!"

# ── PATH warning ──
USER_BIN=""
case "$OS" in
    linux)   USER_BIN="$HOME/.local/bin" ;;
    macos)   USER_BIN="$HOME/.local/bin" ;;
    windows) USER_BIN="$HOME/.local/bin" ;;
esac

if [ -n "$USER_BIN" ]; then
    case ":$PATH:" in
        *:"$USER_BIN":*) ;;
        *)
            echo ""
            echo "  ${BOLD}Add to PATH:${NC}"
            echo "    echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc"
            echo "    source ~/.bashrc"
            ;;
    esac
fi

# ── setup .env ──
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
    fi
    echo ""
    echo "  ${BOLD}Set up API keys:${NC}"
    echo "    cd \"$PWD\" && nano .env"
    echo "    # Set OPENAI_BASE_URL and OPENAI_API_KEY"
fi

echo ""
echo "  ${CYAN}µ${NC} Run: ${BOLD}microagent${NC}"
echo ""

# cleanup
cd /tmp
rm -rf "$TMP" 2>/dev/null
