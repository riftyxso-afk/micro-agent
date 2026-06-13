# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MicroAgent is a multi-model AI chat workspace with a premium, calm aesthetic. The project is a monorepo with two main parts:

- **`frontend/`** — React SPA (CRA + Craco) with Tailwind CSS, shadcn/ui components, and Framer Motion
- **`backend/`** — FastAPI server with MongoDB (Motor async driver) for chat persistence

## Commands

### Frontend
```bash
cd frontend
npm start          # Development server (port 3000, proxies /api to backend)
npm run build      # Production build to frontend/build/
npm test           # Run tests (interactive watch mode)
```

### Backend
```bash
cd backend
python server.py   # Run FastAPI server (default port 8001)
```

### Development Notes
- Frontend proxies `/api/*` requests to `http://127.0.0.1:8001` via `package.json` proxy
- Backend reads config from `backend/.env` (copy from `.env.example`)
- No lint/test scripts configured for backend; use `pytest`, `black`, `flake8` directly

## Architecture

### Frontend Structure
```
frontend/src/
├── pages/           # Route pages (LandingPage, HomeWorkspace, ChatInterface)
├── components/
│   ├── ui/          # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── workspace/   # Shared workspace components (Sidebar, PromptComposer)
│   ├── chat/        # Chat-specific components (MessageBubble, ThinkingBlock)
│   └── landing/     # Landing page components (Navbar, HeroComposer)
├── constants/       # Static config (test IDs)
├── hooks/           # Custom hooks (useTypewriter, use-toast)
├── lib/
│   ├── workspaceData.js   # Centralized data model (models, chips, rooms)
│   └── chatApi.js         # Backend API client
└── index.css        # Global styles + CSS variables (design tokens)
```

### Routing
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | LandingPage | Marketing landing with hero prompt composer |
| `/home` | HomeWorkspace | Main workspace with prompt composer |
| `/chat` | ChatInterface | Chat view with message history |

Landing composer submits → `/home?prompt=<encoded>` (Home pre-fills composer)

### Shared Data Model (`workspaceData.js`)
- **`MODELS`** — 9 AI models with `id`, `name`, `credits`, `color`, `categories`, `isExpensive`
- **`AUTO_MODEL`** — Special model that auto-selects best model
- **`QUICK_CHIPS`** — 5 action chips (Research, Create, Analyse, Imagine, Solve) with room mappings
- **`buildMockAnswer()`** — Deterministic mock response generator for frontend-only demo

### Backend API
- **Framework**: FastAPI with async MongoDB (Motor)
- **Proxy**: 9router API for AI model routing
- **Web Search**: Firecrawl/Tavily APIs
- **Status Check Persistence**: MongoDB-backed (disabled if env not configured)

## Design System

### Color Tokens (CSS Variables in `index.css`)
```css
--ma-bg: #F7F7F8          /* Page background */
--ma-card: #FFFFFF        /* Card surfaces */
--ma-text: #111111        /* Primary text */
--ma-muted: #6B7280       /* Secondary text */
--ma-border: #E5E7EB      /* Borders */
--ma-accent-1/2/3:        /* Soft blue→lavender gradient accents */
--ma-shadow-sm/md:        /* Elevation shadows */
```

### Typography
- **Headings**: Space Grotesk (500, 600)
- **Body/UI**: Inter (400, 500, 600)

### Key Design Rules
- **No universal `transition: all`** — always specify transitions for specific properties
- **No center-aligned app container** — don't add `.App { text-align: center }`
- **Gradients**: Only logo mark and faint hero overlay; never on text-heavy areas; keep under 20% viewport
- **No dark gradients** — avoid purple/pink combos; use soft blue→lavender only
- **Icons**: lucide-react only (thin icons, strokeWidth ~1.75), no emoji
- **Motion**: Framer Motion for entrances; respect `prefers-reduced-motion`

### Components
- Use shadcn/ui primitives from `src/components/ui/` — never raw HTML for dropdowns/toasts
- Named exports for components (`export const ComponentName`)
- Default export for pages (`export default function PageName()`)
- Toasts: `sonner` library

## Testing

- Frontend: Interactive watch mode via `npm test`
- Backend: `pytest` for unit tests
- Manual testing checklist in `test_result.md`
- All interactive elements must include `data-testid` attributes (kebab-case)

## Environment Variables

### Backend (`backend/.env`)
```
MONGO_URL=              # MongoDB connection string
DB_NAME=                # Database name
OPENAI_MODEL=           # Default model ID
CORS_ORIGINS=*          # Allowed CORS origins
FIRECRAWL_API_KEY=      # Web search API key
TAVILY_API_KEY=         # Alternative web search API key
```
