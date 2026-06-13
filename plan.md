# plan.md

## Objectives
- ✅ Deliver a high-fidelity **MicroAgent Home / Main Workspace** screen (frontend-only) with a calm, premium AI command-center aesthetic.
- ✅ Implement **light interactions** on Home: typing in prompt composer, model selector, quick action chips, sidebar active states, working sidebar collapse.
- ✅ Add **subtle micro-interactions** (soft fades, hover lifts) and ensure responsive behavior (desktop/tablet/mobile).
- ✅ Enforce consistent visual tokens (light background, soft shadows, large radii, thin icons) and add `data-testid` attributes to all interactive elements.
- ✅ Deliver a high-fidelity **MicroAgent Chat Interface** screen (frontend-only) as a polished multi-model AI chat workspace with:
  - Model transparency (model name/icon, Auto Mode label, credit cost, timestamp/status per assistant message)
  - Collapsible **Thinking** summary block (user-friendly, not chain-of-thought)
  - Message lifecycle states (pending/thinking/streaming/completed/error)
  - Credit UX (balance in top bar; per-message cost; expensive model warning)
  - **Model picker** (search + category tabs + model cards) and consistent composer behavior
  - Light interactions using **mock data** (no AI backend)
- 🚧 NEW: Build a modern, premium, highly interactive **MicroAgent Landing Page** (frontend-only) using **React + Tailwind + Framer Motion + lucide-react**, with the **hero prompt composer** as the primary focus.
- 🚧 NEW: Restructure routing to match landing-page flow:
  - `/` = Landing Page
  - `/home` = existing Home workspace
  - `/chat` = Chat Interface
  - Landing prompt submit → `/home?prompt=<encoded>` (Home pre-fills composer)

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

### Phase 3: Chat Interface (frontend-only, mock interactions)

#### 3.1 Shared foundations & refactor (to support Home → Chat integration)
1. **Routing & navigation**
   - Add `/chat` route.
   - Implement integrated navigation: **Home send → navigate to `/chat`** with seeded first user message.
   - Direct visit to `/chat` preloads the spec’s example conversation.
2. **Shared data model**
   - Centralize constants into `workspaceData.js`:
     - Model list with `id`, `name`, `credits`, `categories`, `color`, `isExpensive` + an `Auto Select Model`.
     - Room mapping for chips → room badge label.
3. **Unified PromptComposer upgrade (used in both Home and Chat)**
   - Add `onSend(text, attachments)` callback.
   - Support send → stop state while generating (Chat).
   - Keep placeholder updates, web toggle, attachments UI consistent.
   - Add/keep `data-testid` for stop: `stop-generation-button`.

#### 3.2 Chat screen layout (high fidelity)
4. **Left Sidebar (same as Home)**
   - Reuse existing Sidebar component and active state behavior.
5. **Sticky Top Bar**
   - Title: **New Chat**
   - Room badge: default **Chat Room**; updates via chips.
   - Credit balance badge: **⚡ 4,250** (decrements per message cost).
   - User avatar “R” top-right.
   - Thin bottom border; white/transparent background.
   - Add `data-testid`: `chat-topbar`, `chat-title`, `room-badge`, `credit-balance`, `user-avatar`.
6. **Main chat area**
   - Centered reading width ~760–900px.
   - User bubbles right-aligned.
   - Assistant responses left-aligned in clean card style.
   - Comfortable whitespace and typography.

#### 3.3 Assistant message design (model transparency + states)
7. **Assistant response header (required)**
   - Model icon + name + optional Auto Mode label + credit cost + timestamp/status.
   - Add `data-testid`: `assistant-header`, `assistant-model-name`, `assistant-auto-label`, `assistant-credit-cost`, `assistant-status`.
8. **Thinking / Loading block (collapsible)**
   - Collapsible header `Thinking ▾`.
   - Content: short friendly summary steps only.
   - Add `data-testid`: `thinking-toggle`, `thinking-content`.
9. **Message lifecycle states**
   - pending → thinking → streaming → completed.
   - error: soft red card + retry.
   - Add `data-testid`: `retry-button`.

#### 3.4 Example conversation content
10. **Preloaded example on direct /chat visit**
    - User: “Create an iOS Dynamic Island notification component in HTML with animations.”
    - Assistant: DeepSeek v4 Pro, ⚡5, “just now” + code block preview.

#### 3.5 Bottom composer + room chips
11. **Sticky bottom prompt composer (chat)**
    - Placeholder: “Ask anything”.
    - Attachment/tools/image/web icons.
    - Model selector shows `DeepSeek v4 Pro · ⚡5` or `Auto Select Model` when Auto Mode.
    - Wand toggle.
    - Circular send becomes stop during streaming.
    - Add `data-testid`: `chat-composer`.
12. **Quick room/action chips near composer**
    - Research / Create / Analyse / Imagine / Solve.
    - Clicking updates room badge + active chip state.

#### 3.6 Model picker (new) + credit warnings
13. **Model Selector UI (Modal)**
    - Search input, category tabs, 9 model cards.
    - Selected card stronger border + check.
    - Mobile: full-screen modal.
    - Add `data-testid`: `model-picker`, `model-search-input`, `model-tab-*`, `model-card-*`.
14. **Expensive model warning UX (GPT 5.5)**
    - Warning panel and buttons: `use-ultra-button`, `switch-cheaper-button`.

#### 3.7 Mock interaction engine (no backend)
15. **Send → generate loop (deterministic)**
    - Creates user message + assistant message.
    - Thinking block shows friendly summary.
    - Streaming simulates progressive text.
    - Stop halts generation.
16. **Deterministic error state**
    - Prompts containing `error` trigger error state; retry succeeds.
17. **Cleanup**
    - Ensure timers/intervals are cleared on unmount.

#### 3.8 Testing checkpoint (Phase 3)
18. **Manual verification + testing_agent_v3**
    - Validate navigation, states, model picker, expensive warning, credits decrement, mobile.

**User stories (Phase 3)**
1. As a user, I send a prompt from Home and land in /chat with my message and a generating assistant response.
2. As a user, I see exactly which model answered each message, what it cost, and when.
3. As a user, I can expand/collapse the Thinking summary on any assistant message.
4. As a user, I watch responses stream in and can stop generation midway.
5. As a user, I open the model picker, search/filter by category tabs, and switch models.
6. As a user, I get a clear warning before using the expensive GPT 5.5 model.
7. As a user, I click quick chips to change the room/mode shown in the top bar.
8. As a user, I see a friendly error card with retry when something goes wrong.
9. As a mobile user, I get bottom nav and a full-screen model picker.

---

### Phase 4: MicroAgent Landing Page (frontend-only, interactive, conversion-focused) — **NEW CURRENT PHASE**

#### 4.1 Routing restructure + integration
1. **Route updates (confirmed)**
   - `/` → **LandingPage**
   - `/home` → **HomeWorkspace** (move existing Home from `/`)
   - `/chat` → **ChatInterface** (unchanged)
2. **Prompt routing behavior (confirmed)**
   - Landing prompt submit → `/home?prompt=<encoded>`
   - Empty prompt submit → `/home`
3. **Home prefill**
   - HomeWorkspace reads `?prompt=` and pre-fills composer (user reviews then sends to chat).
   - Requires PromptComposer support for `initialValue`/controlled value.
4. **Navigation consistency**
   - Sidebar **New** on Chat and Home navigates to `/home` (not `/`).

#### 4.2 Global styling + motion tokens
5. **Inter font & Tailwind default**
   - Ensure Inter is imported; configure `--font-sans: 'Inter', sans-serif;`.
6. **Cursor blink animation**
   - Add `@keyframes blink` + `.animate-blink`.
7. **Optional premium ambient motion**
   - Soft float, gradient blur pulse, slow background movement (subtle; respect reduced motion).

#### 4.3 Landing layout (required sections)
8. **Background cinematic layer**
   - `<video>` (muted, playsInline, preload auto, loop, autoplay) with ~0.20–0.35 opacity.
   - Overlay gradient `from-white/70 via-white/90 to-white` for readability.
   - If mouse scrubbing is too complex, skip (fallback to soft animated gradient is allowed).
9. **Fixed interactive navbar**
   - Left: gradient logo mark + “MicroAgent”.
   - Center (desktop): Product, Models, Rooms, Pricing, Docs.
   - Right: Login + black “Start for free”.
   - Mobile: hamburger → animated X + full-screen overlay with links and CTAs.
10. **Hero section**
    - Typewriter headline via `useTypewriter(text, speed=38, startDelay=600)`:
      - `All AI.\nOne workspace.`
      - Show cursor while typing.
    - Hero description copy (real MicroAgent copy from spec).
    - Motion: fade/drop-in.
11. **Hero prompt composer (most important)**
    - Large rounded composer (rounded-[32px], premium shadow) with:
      - textarea placeholder “Ask anything with MicroAgent”
      - attachment + web icons
      - model selector (opens ModelPicker)
      - Auto Mode toggle
      - circular send button (disabled when empty)
    - Submit behavior routes to `/home?prompt=`.
    - Enter to submit; Shift+Enter newline.
12. **Quick action chips**
    - Research / Create / Analyse / Imagine / Solve with icons, hover lift, active state.
    - Click updates active mode and placeholder/suggestion.
    - Motion: stagger.
13. **Model showcase section**
    - Use model cards consistent with the picker styling.
14. **Feature section**
    - Title: “Everything you need to work with AI”.
    - 6 feature cards (copy from spec).
    - Motion: fade-up on scroll.
15. **AI Rooms section**
    - Title: “Choose a room. Start faster.”
    - 4 room cards (Research/Study/Content/Code) with Start → `/home`.
16. **Credit system section**
    - Title + transparency description.
    - Grid of model cards showing sample costs.
17. **Compare AI section**
    - Side-by-side responses (DeepSeek vs Gemini) + “Combine best answer” button.
    - Light interaction: reveal combined answer card.
18. **Upload file section**
    - Upload card visual + PDF icon + small Q&A preview.
19. **Final CTA section**
    - Title: “Start with one prompt.”
    - “Start for free” → `/home`.
20. **Footer**
    - Links + “© 2026 MicroAgent. All rights reserved.”

#### 4.4 Testing checkpoint (Phase 4)
21. **Full pass with screenshot + testing_agent_v3**
    - Landing UX: navbar, typewriter, hero composer submit routing.
    - Model picker + GPT 5.5 warning.
    - Quick chips active state.
    - Scroll reveals.
    - Compare AI combine interaction.
    - `/home?prompt=` prefill works.
    - Regression: `/home` and `/chat` still function.
    - Carry-over verifications folded into this pass:
      - Chat Auto Mode header shows “Gemini 3.1 Pro · Auto Mode · ⚡30” and credits drop by 30.
      - Sidebar New on `/chat` navigates to `/home`.

**User stories (Phase 4)**
1. Visitor lands on `/`, sees typewriter headline + description and understands MicroAgent immediately.
2. Visitor types a prompt and routes to `/home` with prompt prefilled.
3. Visitor opens model picker, searches/filters, sees GPT 5.5 warning, selects a model.
4. Visitor toggles Auto Mode and sees “Auto Select Model” in the composer.
5. Visitor clicks quick chips and sees active state + placeholder updates.
6. Visitor scrolls and sections reveal smoothly.
7. Visitor clicks “Combine best answer” and sees combined card.
8. Visitor clicks Start buttons/“Start for free” and lands on `/home`.
9. Mobile visitor uses hamburger overlay; sections stack; composer full width; model picker full-screen.
10. Regression/carry-over: Chat Auto Mode metadata/cost works; sidebar New routes to `/home`.

---

### Phase 5: Future (Optional, only after approval)
- Persist UI preferences locally (collapsed sidebar, last model, last room, last chip) via `localStorage`.
- Add real backend chat flow (would trigger a new Phase 1 POC for LLM integration).
- Add authentication.

**User stories (Phase 5)**
1. As a returning user, I want my selected model remembered so I don’t reconfigure each time.
2. As a user, I want my sidebar state remembered so the layout stays consistent.
3. As a user, I want prompts to persist so I can continue where I left off.
4. As a user, I want real responses from selected models so the workspace becomes functional.
5. As a user, I want my workspace secured behind login so my history and files are private.

## Next Actions
1. Implement LandingPage at `/` with fixed navbar, background video layer, typewriter hero, and hero prompt composer.
2. Wire landing composer submit to `/home?prompt=`.
3. Move HomeWorkspace to `/home` and implement `?prompt` prefill.
4. Verify sidebar New routes to `/home` across Home/Chat.
5. Add remaining global animations (blink + subtle ambient motion).
6. Run full test pass (landing + routing + carry-over chat verifications + regressions) with testing_agent_v3.

## Success Criteria
- Landing page looks premium, minimal, futuristic, and **not** like a generic SaaS template.
- Hero prompt composer is the focal point and routes correctly to `/home`.
- Model picker works on landing with search/tabs/cards + GPT 5.5 warning.
- Quick action chips animate, toggle, and update suggestions.
- All required sections exist in the specified order with real MicroAgent copy.
- Motion is subtle and premium; respects reduced motion.
- Routing is correct: `/` landing, `/home` workspace, `/chat` chat.
- `/home?prompt=` prefill works and user can then send to `/chat`.
- No console errors; interactive elements include `data-testid` and remain accessible.

---
## STATUS LOG
- [DONE] Phase 1: POC skipped (UI-only task, no integrations).
- [DONE] Phase 2: Full Home UI implemented and verified.
  - Sidebar (collapsible, active states, tooltips)
  - Mobile bottom nav
  - Green avatar menu
  - Greeting + composer + quick chips
  - Unified model picker + Auto Mode + web toggle + attachments
  - Framer-motion entrances + sonner toasts
  - Responsive desktop/tablet/mobile
  - Testing agent pass: **100% (frontend)**
- [DONE] Phase 3: Chat Interface implemented.
  - Model metadata headers, Thinking block, lifecycle states
  - Streaming + Stop, Error + Retry (deterministic)
  - Credits decrement fixed (exactly once per message)
  - Full-screen ModelPicker with tabs/search + GPT 5.5 warning
  - Mobile bottom nav + full-screen picker
  - Testing agent: passed 9/9 tested features with zero bugs; remaining items manually verified via Playwright.
  - Carry-over verifications (to be rechecked post-routing change): Chat Auto Mode header ⚡30, sidebar New navigation.
- [IN PROGRESS] Phase 4: Build premium interactive Landing Page + route restructure + full regression testing.
