# plan.md

## Objectives
- Deliver a high-fidelity **MicroAgent Home / Main Workspace** screen (frontend-only) with a calm, premium AI command-center aesthetic.
- Implement **light interactions**: typing in prompt composer, model selector dropdown, quick action chips, sidebar active states, and working sidebar collapse.
- Add **subtle micro-interactions** (soft fades, hover lifts) and ensure responsive behavior (desktop/tablet/mobile).
- Enforce consistent visual tokens (light background, soft shadows, large radii, thin icons) and add `data-testid` attributes to all interactive elements.

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

### Phase 2: V1 App Development (MVP UI)
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
   - Add `data-testid`: `sidebar-new`, `sidebar-history`, `sidebar-projects`, `sidebar-more`, `sidebar-collapse`.
4. **Avatar + Greeting**
   - Avatar: green circle, “R”, ~40px, pinned top-right.
   - Greeting centered: “Good afternoon, Riftyxso”.
5. **Prompt Composer (core focus)**
   - Large rounded white card (~120px height) with subtle border + shadow.
   - Left-side icons: attachment, tool, image/file, web/search.
   - Model selector button: shows **DeepSeek v4 Pro** + model icon + optional badge “⚡5”.
   - Auto Mode button with magic wand.
   - Send button: circular gray on far right.
   - Implement typing state, disabled/enabled send based on input.
   - Add `data-testid`: `composer-input`, `composer-attach`, `composer-tools`, `composer-image`, `composer-web`, `composer-model`, `composer-automode`, `composer-send`.
6. **Model selector dropdown**
   - Provide a small curated list (e.g., DeepSeek v4 Pro, GPT-4.1, Claude 3.5, Gemini 1.5) with icons.
   - Dropdown opens/closes, selection updates label.
   - Keyboard/escape close if using shadcn `DropdownMenu`.
7. **Quick action chips**
   - 5 chips: Research, Create, Analyse, Imagine, Solve; icons + pill styling.
   - Click sets “active chip” (visual highlight) and optionally pre-fills composer placeholder text (no backend).
   - Add `data-testid`: `chip-research`, `chip-create`, `chip-analyse`, `chip-imagine`, `chip-solve`.
8. **Micro-interactions & motion**
   - Hover lifts on cards/chips/buttons; subtle fade for dropdown/open states.
   - Respect reduced motion (`prefers-reduced-motion`).
9. **Responsive behavior**
   - Desktop/tablet: left sidebar remains; content stays centered.
   - Mobile: sidebar becomes bottom nav or collapses into bottom bar; composer full width; chips wrap.
10. **V1 testing checkpoint**
   - Run one end-to-end UI validation pass (manual + testing agent): verify interactions, responsiveness, and no console errors.

**User stories (Phase 2)**
1. As a user, I want a clean home workspace that focuses on a single prompt composer so I’m not overwhelmed.
2. As a user, I want to type into “Ask anything” so I can prepare a query.
3. As a user, I want to open the model selector and switch models so I feel in control of the AI.
4. As a user, I want to click Auto Mode to understand it’s available, even if it doesn’t run a backend action.
5. As a user, I want to collapse the sidebar to maximize workspace space.
6. As a user on mobile, I want navigation to remain accessible via a bottom bar.

---

### Phase 3: Adding More Features (UI-only enhancements)
1. Add composer “state hints” (e.g., small helper text: “Tip: Try Research for web answers”) without clutter.
2. Add lightweight “recent prompts” preview in History view *only if it stays minimal* (no backend; local state only).
3. Add improved accessibility: focus rings, aria-labels for icons, keyboard navigation for sidebar and chips.
4. Add tiny toast feedback for clicks (e.g., “Model set to …”, “Auto Mode enabled”) via shadcn toast.
5. Refactor into clean component structure (`components/Sidebar`, `components/Composer`, `components/Chips`) and central constants.
6. Testing agent run: ensure interactions and responsiveness still pass after refactor.

**User stories (Phase 3)**
1. As a user, I want keyboard navigation for the model dropdown so I can use the app efficiently.
2. As a user, I want subtle confirmation when I change models so I know the selection applied.
3. As a user, I want quick action chips to optionally prefill my prompt so I can start faster.
4. As a user, I want clear focus styles so the UI is accessible and trustworthy.
5. As a user, I want the UI to remain fast and uncluttered even after enhancements.

---

### Phase 4: Future (Optional, only after approval)
- Persist UI preferences locally (collapsed sidebar, last model, last chip) via `localStorage`.
- Add real backend chat flow (would trigger a new Phase 1 POC for LLM integration).
- Add authentication (ask first; slows down testing).

**User stories (Phase 4)**
1. As a returning user, I want my selected model remembered so I don’t reconfigure each time.
2. As a user, I want my sidebar state remembered so the layout stays consistent.
3. As a user, I want prompts to persist so I can continue where I left off.
4. As a user, I want real responses from selected models so the workspace becomes functional.
5. As a user, I want my workspace secured behind login so my history and files are private.

## Next Actions
1. Create the React component skeleton (Sidebar, Avatar/Greeting, Composer, Chips) and wire layout + responsive grid.
2. Implement model selector dropdown + local state management.
3. Add micro-interactions, hover/focus states, and `data-testid` coverage.
4. Run a full V1 UI test pass (desktop/tablet/mobile) and fix any layout regressions.

## Success Criteria
- UI matches spec: slim sidebar, avatar top-right, centered greeting, main composer card, 5 chips; premium minimal styling.
- All specified interactions work without backend: typing, model dropdown, chips click, sidebar active + collapse.
- Subtle animations present and respect reduced motion.
- Responsive: mobile bottom nav/collapsed sidebar, composer full width, chips wrap.
- No console errors; all interactive elements include `data-testid` and are keyboard accessible.