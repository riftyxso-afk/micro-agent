# plan.md

## Objectives
- ✅ Deliver a high-fidelity **MicroAgent Home / Main Workspace** screen (frontend-only) with a calm, premium AI command-center aesthetic.
- ✅ Implement **light interactions** on Home: typing in prompt composer, model selector, quick action chips, sidebar active states, working sidebar collapse.
- ✅ Add **subtle micro-interactions** (soft fades, hover lifts) and ensure responsive behavior (desktop/tablet/mobile).
- ✅ Enforce consistent visual tokens (light background, soft shadows, large radii, thin icons) and add `data-testid` attributes to all interactive elements.
- 🚧 NEW: Deliver a high-fidelity **MicroAgent Chat Interface** screen (frontend-only) that is a polished multi-model AI chat workspace with:
  - Model transparency (model name/icon, Auto Mode label, credit cost, timestamp/status per assistant message)
  - Collapsible **Thinking** summary block (user-friendly, not chain-of-thought)
  - Message lifecycle states (pending/thinking/streaming/completed/error)
  - Credit UX (balance in top bar; per-message cost; expensive model warning)
  - **Model picker** (search + category tabs + model cards) and consistent composer behavior
  - Light interactions using **mock data** (no AI backend)
- 🔗 Integration objective (confirmed by user): **Home stays at “/”**; sending from Home navigates to **“/chat”** with that message starting the conversation; sidebar **New** returns to Home; direct visit to **/chat** preloads the spec’s example conversation.

## Implementation Steps

### Phase 1: Core POC (Isolation)
> Not required for this task (no external integrations, no backend dependencies; UI-only).

**User stories (Phase 1)**
1. As a user, I want to see the main workspace layout render correctly without any backend.
2. As a user, I want the prompt composer to accept typing so I can draft a question.
3. As a user, I want the model selector to open so I can see available models.
4. As a user, I want the sidebar to show a clear active state so I know where I am.
5. As a user, I want hover feedback so the UI feels premium and responsive.

---

### Phase 2: V1 App Development (MVP UI) — Home Workspace
1. **Project setup & styling base**
   - Confirm Tailwind + shadcn/ui availability; set base fonts, background, and global spacing.
   - Define theme tokens (colors, radii, shadows) in Tailwind config / CSS variables.
2. **Layout scaffolding**
   - Build page shell: left slim sidebar, top-right avatar, centered greeting, composer card, chips row.
   - Ensure centered content width ~60% on desktop and fluid on smaller screens.
3. **Sidebar component**
   - Items: Logo, New, History, Projects, More, bottom Collapse.
   - Implement active state + hover state.
   - Implement **collapse** (icon-only vs icon+label; content area adjusts).
   - Add `data-testid`: `sidebar-new-button`, `sidebar-history-button`, `sidebar-projects-button`, `sidebar-more-button`, `sidebar-collapse-button`, `sidebar-logo`.
4. **Avatar + Greeting**
   - Avatar: green circle, “R”, ~40px, pinned top-right.
   - Greeting centered: “Good afternoon, Riftyxso”.
5. **Prompt Composer (core focus)**
   - Large rounded white card with subtle border + shadow.
   - Icons: attachment, tool, image/file, web/search.
   - Model selector button + credits badge.
   - Auto Mode button with magic wand.
   - Send button: circular, disabled/enabled based on input.
   - Add `data-testid`: `prompt-composer-textarea`, `prompt-composer-attach-button`, `prompt-composer-tools-button`, `prompt-composer-image-button`, `prompt-composer-web-button`, `model-selector-trigger`, `auto-mode-toggle`, `prompt-composer-send-button`.
6. **Model selector dropdown**
   - Provide curated list, selection updates label.
7. **Quick action chips**
   - 5 chips: Research, Create, Analyse, Imagine, Solve; click sets active state and updates placeholder.
   - Add `data-testid`: `quick-chip-research`, `quick-chip-create`, `quick-chip-analyse`, `quick-chip-imagine`, `quick-chip-solve`.
8. **Micro-interactions & motion**
   - Hover lifts, subtle fades, reduced motion compliance.
9. **Responsive behavior**
   - Desktop/tablet: sidebar remains.
   - Mobile: bottom navigation; composer full width; chips wrap.
10. **V1 testing checkpoint**
   - Manual + testing agent pass.

**User stories (Phase 2)**
1. As a user, I want a clean home workspace that focuses on a single prompt composer so I’m not overwhelmed.
2. As a user, I want to type into “Ask anything” so I can prepare a query.
3. As a user, I want to open the model selector and switch models so I feel in control of the AI.
4. As a user, I want to click Auto Mode to understand it’s available, even if it doesn’t run a backend action.
5. As a user, I want to collapse the sidebar to maximize workspace space.
6. As a user on mobile, I want navigation to remain accessible via a bottom bar.

---

### Phase 3: Chat Interface (frontend-only, mock interactions) — **NEW CURRENT PHASE**

#### 3.1 Shared foundations & refactor (to support Home → Chat integration)
1. **Routing & navigation**
   - Add `/chat` route.
   - Keep Home at `/`.
   - Implement integrated navigation: **Home send → navigate to `/chat`** with seeded first user message.
   - Sidebar **New** navigates back to `/`.
2. **Shared data model**
   - Refactor shared constants into a single source (e.g., `workspaceData.js`):
     - Model list with `id`, `name`, `credits`, `categoryTags`, `color`, and `isExpensive`.
     - Room mapping for chips → room badge label:
       - Research → Research Room
       - Create → Content Room
       - Analyse → File/Research Mode
       - Imagine → Image Mode
       - Solve → Study/Reasoning Mode
3. **Unified PromptComposer upgrade (used in both Home and Chat)**
   - Add `onSend(text)` callback.
   - Support send → stop state while generating (Chat only; Home uses send-to-chat).
   - Ensure placeholder updates, web toggle, attachments UI remain consistent.
   - Keep all existing `data-testid` and add any new ones needed (e.g., `stop-generation-button` if separate).

#### 3.2 Chat screen layout (high fidelity)
4. **Left Sidebar (same as Home)**
   - Reuse existing Sidebar component and active state behavior.
5. **Sticky Top Bar**
   - Title: **New Chat**
   - Room badge: default **Chat Room**; updates via chips.
   - Credit balance badge: **⚡ 4,250** (decrement with message costs).
   - User avatar “R” top-right.
   - Thin bottom border; white/transparent background.
   - Add `data-testid`:
     - `chat-topbar`, `chat-title`, `room-badge`, `credit-balance`, `chat-avatar`.
6. **Main chat area**
   - Centered reading width ~760–900px.
   - User bubbles right-aligned.
   - Assistant responses left-aligned in clean card style.
   - Comfortable whitespace and typography.

#### 3.3 Assistant message design (model transparency + states)
7. **Assistant response header (required)**
   - Model icon + name + optional Auto Mode label + credit cost + timestamp/status.
   - States examples:
     - Completed: `DeepSeek v4 Pro · ⚡5 · just now`
     - Auto-selected: `Gemini 3.1 Pro · Auto Mode · ⚡30 · just now`
     - Generating: `DeepSeek v4 Pro · generating...`
   - Add `data-testid`:
     - `assistant-header`, `assistant-model-name`, `assistant-credit-cost`, `assistant-status`.
8. **Thinking / Loading block (collapsible)**
   - Collapsible header `Thinking ▾`.
   - Content: short friendly summary steps only:
     - Understanding the request
     - Choosing the best approach
     - Generating the response
   - Style: slightly indented, left border, muted text, smooth open/close.
   - NO chain-of-thought.
   - Add `data-testid`: `thinking-toggle`, `thinking-content`.
9. **Message lifecycle states**
   - pending
   - thinking (thinking open + shimmer/dots)
   - streaming (partial answer typing in; thinking visible)
   - completed
   - error (soft red card + retry)
   - Add `data-testid`: `message-state`, `retry-button`.

#### 3.4 Example conversation content
10. **Preloaded example on direct /chat visit**
    - User: “Create an iOS Dynamic Island notification component in HTML with animations.”
    - Assistant (DeepSeek v4 Pro, ⚡5, just now):
      - Thinking block + intro + code block preview.
    - Code block: premium dark card style with monospaced font and optional copy button.

#### 3.5 Bottom composer + room chips
11. **Sticky bottom prompt composer (chat)**
    - Placeholder: “Ask anything”.
    - Attachment/tools/image/web icons.
    - Model selector shows `DeepSeek v4 Pro · ⚡5` or `Auto Select Model` when Auto Mode.
    - Wand toggle.
    - Circular send button becomes **stop** during streaming.
    - Add `data-testid`: `chat-composer`, keep existing composer testids.
12. **Quick room/action chips near composer**
    - Research / Create / Analyse / Imagine / Solve.
    - Clicking updates room badge + active chip state.
    - Add `data-testid`: reuse `quick-chip-*`.

#### 3.6 Model picker (new) + credit warnings
13. **Model Selector UI (Popover/Modal)**
    - Trigger opens a **Model Picker** containing:
      - Search input “Search models”
      - Category tabs: All, Pro, Reasoning, Coding, Writing, Speed
      - Model cards (9):
        - Auto Select Model
        - Gemini 2.5 Flash Lite — ⚡1
        - MiniMax M2.7 — ⚡1
        - Claude Haiku 4.5 — ⚡5
        - Kimi K2.6 — ⚡5
        - Grok 4.3 — ⚡10
        - DeepSeek v4 Pro — ⚡5
        - Gemini 3.1 Pro — ⚡30
        - GPT 5.5 — ⚡400
    - Selected card has stronger border.
    - Mobile: full-screen modal.
    - Add `data-testid`:
      - `model-picker`, `model-search-input`, `model-tab-all|pro|reasoning|coding|writing|speed`, `model-card-<id>`.
14. **Expensive model warning UX (GPT 5.5)**
    - Warning text:
      - “This model uses ⚡400 credits per message. Use it for complex reasoning or important tasks.”
    - Buttons:
      - “Use Ultra Model”
      - “Switch to Cheaper Model”
    - Ensure selection flows work and update composer label.

#### 3.7 Mock interaction engine (no backend)
15. **Send → generate loop (deterministic)**
    - Sending creates a user message.
    - Assistant message appears in `thinking` state.
    - After short delay: `streaming` state with progressive text.
    - Completion: full answer + status “just now” + credit cost.
    - Credits decrement from balance accordingly.
    - Stop button aborts streaming and marks message as stopped/completed.
16. **Deterministic error state**
    - If user prompt contains the word `error`, assistant returns `error` card:
      - “Something went wrong. Try again.” + Retry.
    - Retry restarts the mock generation.
17. **Cleanup**
    - Ensure timers are cleared on unmount/navigation.

#### 3.8 Testing checkpoint (Phase 3)
18. **Manual verification + testing_agent_v3**
    - Validate integration flow: Home → Chat seeded message.
    - Validate chat states: thinking, streaming, stop, completed, error+retry.
    - Validate model picker: search/tabs/cards, expensive warning.
    - Validate credits decrement.
    - Validate mobile: bottom nav, full-screen model picker modal.

**User stories (Phase 3)**
1. As a user, I send a prompt from Home and land in /chat with my message and a generating assistant response.
2. As a user, I see exactly which model answered each message, what it cost, and when.
3. As a user, I can expand/collapse the Thinking summary on any assistant message.
4. As a user, I watch responses stream in and can stop generation midway.
5. As a user, I open the model picker, search/filter by category tabs, and switch models — composer + next responses reflect it.
6. As a user, I get a clear warning before using the expensive GPT 5.5 model and can choose a cheaper one.
7. As a user, I click quick chips to change the room/mode shown in the top bar.
8. As a user, I see a friendly error card with retry when something goes wrong.
9. As a mobile user, I get bottom nav, full-width composer, and a full-screen model picker.

---

### Phase 4: Future (Optional, only after approval)
- Persist UI preferences locally (collapsed sidebar, last model, last room, last chip) via `localStorage`.
- Add real backend chat flow (would trigger a new Phase 1 POC for LLM integration).
- Add authentication (ask first; slows down testing).

**User stories (Phase 4)**
1. As a returning user, I want my selected model remembered so I don’t reconfigure each time.
2. As a user, I want my sidebar state remembered so the layout stays consistent.
3. As a user, I want prompts to persist so I can continue where I left off.
4. As a user, I want real responses from selected models so the workspace becomes functional.
5. As a user, I want my workspace secured behind login so my history and files are private.

## Next Actions
1. Implement `/chat` screen layout (sidebar + sticky top bar + centered chat area + sticky composer).
2. Build assistant message components with model header + collapsible thinking summary + lifecycle states.
3. Build unified Model Picker (search + tabs + model cards + expensive warning) and wire to composer.
4. Implement mock send/generate/stream/stop/error+retry engine + credit decrement.
5. Integrate Home → Chat navigation (seed initial prompt) and Sidebar New → Home.
6. Run full test pass (desktop + mobile) with testing_agent_v3 and fix any regressions.

## Success Criteria
- Home remains polished and unchanged visually, and now **navigates into Chat** when sending a prompt.
- Chat UI matches spec: sidebar, sticky top bar (title/room/credits/avatar), centered messages, premium assistant cards with model metadata.
- Thinking block is **collapsible** and contains only friendly summaries (no chain-of-thought).
- Mock lifecycle states work: thinking → streaming (stop available) → completed; error state with retry.
- Model picker supports search + category tabs + model cards; expensive model warning works.
- Credit balance is visible and decrements with message costs.
- Responsive behavior works across desktop/tablet/mobile (mobile bottom nav + full-screen model picker).
- No console errors; all interactive elements include `data-testid` and are keyboard accessible.

---
## STATUS LOG
- [DONE] Phase 1: POC skipped (UI-only task, no integrations).
- [DONE] Phase 2: Full Home UI implemented and verified.
  - Sidebar (collapsible, active states, tooltips)
  - Mobile bottom nav
  - Green avatar menu
  - Greeting + composer + quick chips
  - Model selection, Auto Mode, web toggle, attachments pills
  - Framer-motion entrances + sonner toasts
  - Responsive desktop/tablet/mobile
  - Testing agent pass: **100% (frontend)**
- [IN PROGRESS] Phase 3: Build MicroAgent Chat Interface screen.
  - Integrated flow confirmed: Home `/` → Chat `/chat` on send; sidebar New → Home; direct `/chat` loads example conversation.
