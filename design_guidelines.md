{
  "project": {
    "name": "MicroAgent",
    "screen": "Home / Main Workspace (single-page, frontend-only)",
    "brand_attributes": [
      "calm futuristic command-center",
      "premium minimal",
      "spacious + quiet confidence",
      "fast + tool-like (not social)",
      "trustworthy + precise"
    ]
  },

  "visual_style": {
    "north_star": "ChatGPT simplicity + Poe model switching + Perplexity research affordances, but calmer and more premium.",
    "do_not": [
      "No dashboard cards, no charts, no clutter",
      "No heavy gradients; gradients only as small accents (<20% viewport)",
      "No centered app container rule in CSS",
      "No transition: all"
    ],
    "layout_principle": "One dominant action: the prompt composer. Everything else is lightweight navigation or quick-start chips."
  },

  "typography": {
    "google_fonts": {
      "heading": {
        "family": "Space Grotesk",
        "weights": ["500", "600"]
      },
      "body": {
        "family": "Inter",
        "weights": ["400", "500", "600"]
      }
    },
    "usage": {
      "app_default": "Inter",
      "hero_greeting": "Space Grotesk",
      "ui_labels": "Inter"
    },
    "scale_tailwind": {
      "h1_greeting": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
      "h2_subheading": "text-base md:text-lg text-muted-foreground",
      "body": "text-sm sm:text-base",
      "small": "text-xs text-muted-foreground"
    },
    "letter_spacing": {
      "headings": "tracking-tight",
      "labels": "tracking-[-0.01em]"
    }
  },

  "color_system": {
    "notes": [
      "User-specified tokens MUST be respected: bg #FAFAFA/#F7F7F8, card #FFF, text #111, secondary #6B7280, border #E5E7EB",
      "Accent is a soft blue/purple gradient used sparingly (logo mark + tiny highlights only)"
    ],
    "tokens_css": {
      "where": "/app/frontend/src/index.css (override :root HSL tokens to match hex intent)",
      "css_variables": {
        "--ma-bg": "#F7F7F8",
        "--ma-card": "#FFFFFF",
        "--ma-text": "#111111",
        "--ma-muted": "#6B7280",
        "--ma-border": "#E5E7EB",

        "--ma-accent-1": "#7DD3FC",
        "--ma-accent-2": "#A5B4FC",
        "--ma-accent-3": "#C4B5FD",

        "--ma-success": "#16A34A",
        "--ma-focus": "#60A5FA",

        "--ma-shadow-sm": "0 1px 2px rgba(17, 24, 39, 0.06)",
        "--ma-shadow-md": "0 10px 30px rgba(17, 24, 39, 0.06)",
        "--ma-shadow-ring": "0 0 0 4px rgba(96, 165, 250, 0.25)",

        "--ma-radius-xl": "24px",
        "--ma-radius-2xl": "32px"
      },
      "allowed_gradients": {
        "logo_mark": "linear-gradient(135deg, #7DD3FC 0%, #A5B4FC 45%, #C4B5FD 100%)",
        "hero_decor_overlay": "radial-gradient(600px circle at 50% 0%, rgba(125,211,252,0.22), transparent 55%), radial-gradient(700px circle at 80% 20%, rgba(196,181,253,0.18), transparent 60%)"
      }
    },
    "semantic_mapping": {
      "background": "var(--ma-bg)",
      "surface": "var(--ma-card)",
      "text_primary": "var(--ma-text)",
      "text_secondary": "var(--ma-muted)",
      "border": "var(--ma-border)",
      "focus_ring": "var(--ma-shadow-ring)",
      "avatar_green": "#22C55E"
    }
  },

  "spacing_and_grid": {
    "grid": {
      "desktop": "Sidebar fixed 88px (collapsed) / 220px (expanded). Main content max-w: 920px centered within remaining area.",
      "content_container": "mx-auto w-full max-w-[920px] px-4 sm:px-6",
      "vertical_rhythm": "Use 24–40px gaps between major blocks (greeting → composer → chips)."
    },
    "touch_targets": "Minimum 44px height for primary interactive controls (chips, buttons, sidebar items)."
  },

  "components": {
    "component_path": {
      "shadcn": {
        "Button": "/app/frontend/src/components/ui/button.jsx",
        "Card": "/app/frontend/src/components/ui/card.jsx",
        "Avatar": "/app/frontend/src/components/ui/avatar.jsx",
        "Badge": "/app/frontend/src/components/ui/badge.jsx",
        "DropdownMenu": "/app/frontend/src/components/ui/dropdown-menu.jsx",
        "Tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
        "Input": "/app/frontend/src/components/ui/input.jsx",
        "Textarea": "/app/frontend/src/components/ui/textarea.jsx",
        "Separator": "/app/frontend/src/components/ui/separator.jsx",
        "Sheet": "/app/frontend/src/components/ui/sheet.jsx",
        "Switch": "/app/frontend/src/components/ui/switch.jsx"
      },
      "icons": {
        "library": "lucide-react",
        "usage": "Use thin icons (size 18–20). Keep strokeWidth ~1.75."
      }
    },

    "sidebar": {
      "layout": {
        "desktop": "Left vertical rail with icon buttons + tiny labels. Collapsible: expanded shows labels inline; collapsed shows labels under icons.",
        "mobile": "Bottom navigation bar with 5 items + floating 'New' action (optional) OR keep 'New' as first tab."
      },
      "styles_tailwind": {
        "rail": "fixed left-0 top-0 h-dvh bg-[var(--ma-bg)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--ma-bg)]/60 border-r border-[var(--ma-border)]",
        "item": "group flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs text-[var(--ma-muted)] hover:text-[var(--ma-text)] hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ma-focus)]",
        "item_active": "bg-white shadow-[var(--ma-shadow-sm)] text-[var(--ma-text)]"
      },
      "data_testids": {
        "new": "sidebar-new-button",
        "history": "sidebar-history-button",
        "projects": "sidebar-projects-button",
        "more": "sidebar-more-button",
        "collapse": "sidebar-collapse-button",
        "logo": "sidebar-logo"
      }
    },

    "top_right_avatar": {
      "component": "Avatar",
      "styles_tailwind": {
        "wrapper": "absolute right-4 top-4 sm:right-6 sm:top-6",
        "avatar": "h-10 w-10 rounded-full bg-[#22C55E] text-white",
        "fallback": "font-semibold"
      },
      "data_testids": {
        "avatar": "user-avatar"
      }
    },

    "greeting": {
      "copy": "Good afternoon, Riftyxso",
      "styles_tailwind": {
        "wrap": "pt-20 sm:pt-24",
        "h1": "text-center font-[Space_Grotesk] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--ma-text)]",
        "sub": "mt-3 text-center text-base md:text-lg text-[var(--ma-muted)]"
      }
    },

    "prompt_composer": {
      "structure": [
        "Large Card container (rounded 2xl/3xl)",
        "Top row: placeholder input area (Textarea autosize feel)",
        "Bottom row: left icon cluster (attach/tools/image/web), center model selector, auto mode, right send button"
      ],
      "recommended_shadcn": ["Card", "Textarea", "Button", "DropdownMenu", "Badge", "Tooltip"],
      "styles_tailwind": {
        "card": "mx-auto mt-10 w-full max-w-[920px] rounded-[var(--ma-radius-2xl)] bg-[var(--ma-card)] border border-[var(--ma-border)] shadow-[var(--ma-shadow-md)]",
        "inner": "p-4 sm:p-5",
        "textarea": "min-h-[72px] resize-none border-0 bg-transparent p-0 text-[15px] leading-6 text-[var(--ma-text)] placeholder:text-[var(--ma-muted)] focus-visible:ring-0",
        "toolbar": "mt-4 flex items-center justify-between gap-3",
        "icon_button": "h-10 w-10 rounded-2xl border border-[var(--ma-border)] bg-white hover:bg-[var(--ma-bg)] text-[var(--ma-muted)] hover:text-[var(--ma-text)] shadow-[var(--ma-shadow-sm)]",
        "model_button": "h-10 rounded-2xl border border-[var(--ma-border)] bg-white px-3 text-sm text-[var(--ma-text)] shadow-[var(--ma-shadow-sm)] hover:bg-[var(--ma-bg)]",
        "send": "h-10 w-10 rounded-full bg-[#E5E7EB] text-[#111111] hover:bg-[#D1D5DB] active:scale-[0.98]"
      },
      "model_selector": {
        "default": "DeepSeek v4 Pro",
        "badge": "⚡5",
        "dropdown_items": [
          "DeepSeek v4 Pro",
          "GPT-4.1",
          "Claude 3.7",
          "Gemini 2.5"
        ],
        "data_testids": {
          "trigger": "model-selector-trigger",
          "item_prefix": "model-selector-item-",
          "credit_badge": "model-credit-badge"
        }
      },
      "auto_mode": {
        "interaction": "Toggle-like button with wand icon; when active, subtle tinted background (bg-[var(--ma-bg)]) and a small 'Auto' label.",
        "data_testids": {
          "toggle": "auto-mode-toggle"
        }
      },
      "icons": {
        "attachment": "Paperclip",
        "tools": "Wrench",
        "image_file": "Image",
        "web_search": "Globe",
        "auto": "Wand2",
        "send": "ArrowUp"
      },
      "data_testids": {
        "composer": "prompt-composer",
        "textarea": "prompt-composer-textarea",
        "attach": "prompt-composer-attach-button",
        "tools": "prompt-composer-tools-button",
        "image": "prompt-composer-image-button",
        "web": "prompt-composer-web-button",
        "send": "prompt-composer-send-button"
      }
    },

    "quick_action_chips": {
      "chips": ["Research", "Create", "Analyse", "Imagine", "Solve"],
      "recommended_shadcn": ["Button", "Tooltip"],
      "styles_tailwind": {
        "wrap": "mx-auto mt-6 flex w-full max-w-[920px] flex-wrap items-center justify-center gap-3",
        "chip": "h-10 rounded-full border border-[var(--ma-border)] bg-white px-4 text-sm text-[var(--ma-text)] shadow-[var(--ma-shadow-sm)] hover:bg-[var(--ma-bg)] active:scale-[0.99]"
      },
      "icons": {
        "Research": "Search",
        "Create": "Sparkles",
        "Analyse": "BarChart3",
        "Imagine": "Palette",
        "Solve": "Puzzle"
      },
      "data_testids": {
        "chip_prefix": "quick-chip-"
      }
    }
  },

  "motion_and_microinteractions": {
    "principles": [
      "Soft lift on hover for chips and icon buttons (shadow increases slightly)",
      "Active press scale only on buttons (scale 0.98–0.99)",
      "Sidebar active state: subtle white surface + tiny shadow",
      "Respect prefers-reduced-motion"
    ],
    "tailwind_patterns": {
      "hover": "transition-colors duration-150 ease-out (and transition-shadow for shadow changes)",
      "press": "active:scale-[0.98] transition-transform duration-100",
      "focus": "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ma-focus)]"
    },
    "optional_library": {
      "name": "framer-motion",
      "why": "Entrance fade-up for greeting/composer and subtle sidebar collapse animation.",
      "install": "npm i framer-motion",
      "usage_hint_js": "Use motion.div with initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.35,ease:'easeOut'}}; wrap in prefers-reduced-motion check."
    }
  },

  "accessibility": {
    "requirements": [
      "All interactive elements must have visible focus styles",
      "Icon-only buttons must have aria-label",
      "Ensure contrast: text #111 on white, muted #6B7280 on #F7F7F8",
      "Keyboard navigation: sidebar items, model dropdown, chips, send button",
      "Reduced motion support"
    ],
    "testing": {
      "data_testid_rule": "Every button, dropdown trigger, chip, textarea, and sidebar item MUST include data-testid in kebab-case."
    }
  },

  "responsive_behavior": {
    "breakpoints": {
      "mobile": "<640px",
      "tablet": "640–1024px",
      "desktop": ">=1024px"
    },
    "rules": [
      "Desktop: left sidebar + centered content + avatar top-right",
      "Tablet: sidebar compact; composer uses max-w-[760px]",
      "Mobile: sidebar becomes bottom nav (fixed bottom), content padding-bottom to avoid overlap; composer full width; chips wrap"
    ],
    "mobile_bottom_nav": {
      "styles_tailwind": {
        "bar": "fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--ma-border)] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60",
        "item": "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] text-[var(--ma-muted)]",
        "item_active": "text-[var(--ma-text)]"
      },
      "data_testids": {
        "nav": "mobile-bottom-nav",
        "item_prefix": "mobile-nav-"
      }
    }
  },

  "images": {
    "image_urls": [
      {
        "category": "logo",
        "description": "No external image required. Build logo mark as a 28x28 rounded square div with a soft blue→lavender gradient background and a simple Lucide icon (e.g., Bot or Sparkles) in white at 70% opacity.",
        "url": null
      },
      {
        "category": "background",
        "description": "No photos. Use subtle radial gradient overlays + optional CSS noise texture (very low opacity) to avoid flatness.",
        "url": null
      }
    ]
  },

  "implementation_notes_js": {
    "file_conventions": [
      "This repo uses .jsx (NOT .tsx). Keep components in JSX.",
      "Use named exports for components; default export for the page component.",
      "Use shadcn/ui primitives from /src/components/ui; avoid raw HTML dropdowns/toasts."
    ],
    "css_notes": [
      "Update /app/frontend/src/App.css to remove CRA demo styles (dark header).",
      "Prefer Tailwind + CSS variables in index.css for tokens.",
      "Do not add .App { text-align:center }"
    ]
  },

  "instructions_to_main_agent": [
    "Build a single HomeWorkspace page with: Sidebar (collapsible), Avatar top-right, Greeting centered, PromptComposer card, QuickActionChips row.",
    "Keep the page extremely uncluttered; no extra cards.",
    "Implement model selector using shadcn DropdownMenu; include badge ⚡5 as a Badge component.",
    "All interactive elements must include data-testid attributes exactly as specified (or consistent kebab-case equivalents).",
    "Use lucide-react icons only; no emoji icons.",
    "Mobile: replace sidebar with bottom nav; ensure composer and chips are not hidden behind it (pb-20).",
    "Gradients: only for logo mark and faint hero overlay; never on text-heavy areas; keep under 20% viewport."
  ],

  "general_ui_ux_design_guidelines": "\n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n"
}
