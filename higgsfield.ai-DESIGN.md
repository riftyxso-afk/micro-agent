# Design System Inspired by Higgsfield AI

## 1. Visual Theme & Atmosphere

Higgsfield AI embodies a **cutting-edge, tech-forward aesthetic** designed for creative professionals working with AI-native tools. The visual language combines a **dark, immersive foundation** with **bold neon accents** that pop against deep charcoal and black backgrounds. The atmosphere is sophisticated yet energetic—conveying innovation, precision, and creative power. Neon lime-yellow (`#D1FE17`) and vibrant magenta (`#FF005B`) serve as visual markers for premium features, active states, and calls-to-action, creating a sense of urgency and modernity. The design prioritizes **clarity, contrast, and directness**, with generous use of whitespace and layered depth effects that guide users through complex creative workflows. This is a system designed for makers who demand performance, visual feedback, and seamless integration of AI-powered capabilities into their creative process.

**Key Characteristics**
- Deep dark mode with near-black foundations (`#0F1113`, `#131517`)
- Vibrant neon accents (lime-yellow, magenta) for emphasis and CTAs
- Minimal, high-contrast typography for clarity
- Layered elevation with subtle inset shadows and glow effects
- Premium feel with refined borders and smooth interactions
- AI-forward aesthetic: sleek, modern, confidence-inspiring

## 2. Color Palette & Roles

### Primary
- **Primary Dark Base** (`#131517`): Core background for main surfaces and containers; conveys depth and focus
- **Deep Charcoal** (`#0F1113`): Darkest neutral base for secondary surfaces and overlays; creates layering hierarchy
- **Card Background** (`#1C1E20`): Elevated card and panel backgrounds; slightly lighter than base for visual hierarchy
- **Surface Tertiary** (`#23262A`): Tertiary surface for nested components and sub-sections

### Accent Colors
- **Neon Lime** (`#D1FE17`): Primary accent for CTAs, badges, "NEW" labels, and premium highlights; high visibility
- **Hot Magenta** (`#FF005B`): Secondary accent for discounts, trending tags, and emphasis; drives urgency
- **Magenta Secondary** (`#ED1572`): Softer magenta for hover states and secondary accent applications
- **Lime Green** (`#829B19`): Muted lime for subtle accent variations and status indicators

### Interactive
- **Success Green** (`#53C546`): Success states, confirmations, and positive feedback
- **Error Red** (`#E72930`): Error states, validation failures, and destructive actions
- **Warning Yellow** (`#D1FE17`): Warning states and alert conditions (overlaps with accent)

### Neutral Scale
- **White** (`#FFFFFF`): Primary text on dark backgrounds; maximum contrast for readability
- **Off-White** (`#F7F7F8`): Light text and subtle highlights; secondary content
- **Light Gray** (`#D9D9D9`): Tertiary text and borders; reduced emphasis
- **Mid Gray** (`#B9B9B9`): Disabled states and placeholder text
- **Dark Gray** (`#898A8B`): Secondary text and muted content
- **Black** (`#000000`): Text overlays and contrast elements

### Surface & Borders
- **Border Subtle** (`#D9D9D9` at 4% opacity): Minimal card and container borders; very subtle separation
- **Border Dark** (`#1A1A1A`): Dark container borders and divisions within dark backgrounds
- **Overlay Subtle** (`#000000` at 3% opacity): Transparent overlays for depth without obstruction

## 3. Typography Rules

### Font Family
- **Primary**: `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif`
- **Display/Heading**: `"Space Grotesk", ui-sans-serif, sans-serif`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|-----------------|-------|
| Display XL | Space Grotesk | 48px | 700 | 56px | -0.02em | Hero titles and main headings |
| Display Large | Space Grotesk | 36px | 700 | 44px | -0.015em | Section titles and features |
| Heading XL | Space Grotesk | 28px | 700 | 36px | -0.01em | Page sections |
| Heading Large | Space Grotesk | 24px | 700 | 32px | -0.01em | Card titles and subsections |
| Heading Medium | Space Grotesk | 20px | 700 | 28px | 0em | Component headings |
| Heading Small | Space Grotesk | 16px | 700 | 24px | 0em | Subheadings and labels |
| Body Large | ui-sans-serif | 16px | 400 | 24px | 0em | Primary body copy |
| Body Regular | ui-sans-serif | 14px | 400 | 20px | 0em | Default body text |
| Body Small | ui-sans-serif | 12px | 400 | 18px | 0em | Secondary text and captions |
| Label Bold | Space Grotesk | 12px | 700 | 18px | 0em | Button text and bold labels |
| Label Regular | ui-sans-serif | 12px | 400 | 18px | 0em | Small labels and metadata |
| Caption | ui-sans-serif | 11px | 400 | 16px | 0em | Help text and footnotes |
| Code | `"SF Mono", Monaco, "Cascadia Code", monospace` | 13px | 500 | 20px | 0em | Code snippets and commands |

### Principles
- **Clarity First**: High contrast text on dark backgrounds ensures readability; minimum `#F7F7F8` on `#131517` backgrounds
- **Weight Hierarchy**: Space Grotesk bold (700) reserved for headings, labels, and emphasis; ui-sans-serif regular (400) for body and descriptions
- **Generous Line Height**: Maintains comfortable readability and visual breathing room in dense layouts
- **Monospace for Technical**: Code blocks and commands use monospace for scanning and accuracy
- **All Caps for Accents**: Navigation labels and badge text often rendered in uppercase for visual impact

## 4. Component Stylings

### Buttons

**Button – Primary CTA**
- **Background**: `#D1FE17`
- **Text Color**: `#1A1A1A`
- **Font Size**: `14px`
- **Font Weight**: `500`
- **Font Family**: `system-ui`
- **Padding**: `0px 10px`
- **Height**: `24px` (compact) or `44px` (standard)
- **Border Radius**: `8px`
- **Border**: `0px none`
- **Box Shadow**: `none`
- **Line Height**: `20px`
- **Hover**: Brightness `110%`, slight scale `1.02x`
- **Active**: Brightness `95%`, slight inset shadow

**Button – Secondary (Lime with Background)**
- **Background**: `rgba(209, 254, 23, 0.08)`
- **Text Color**: `#D1FE17`
- **Font Size**: `14px`
- **Font Weight**: `500`
- **Font Family**: `system-ui`
- **Padding**: `0px 10px`
- **Height**: `24px`
- **Border Radius**: `8px`
- **Border**: `0px none`
- **Box Shadow**: `rgba(255, 255, 255, 0.03) 0px 2px 3px 0px inset`
- **Line Height**: `20px`
- **Hover**: Background `rgba(209, 254, 23, 0.15)`, glow effect
- **Active**: Background `rgba(209, 254, 23, 0.12)`

**Button – Ghost (Muted)**
- **Background**: `rgba(0, 0, 0, 0)` (transparent)
- **Text Color**: `rgba(255, 255, 255, 0.3)`
- **Font Size**: `14px`
- **Font Weight**: `500`
- **Font Family**: `ui-sans-serif`
- **Padding**: `4px 8px`
- **Height**: `28px`
- **Border Radius**: `8px`
- **Border**: `0px solid rgba(255, 255, 255, 0.3)`
- **Box Shadow**: `none`
- **Line Height**: `20px`
- **Hover**: Text color `rgba(255, 255, 255, 0.6)`, background `rgba(255, 255, 255, 0.05)`
- **Active**: Text color `rgba(255, 255, 255, 0.8)`

**Button – Icon Square**
- **Background**: `rgba(0, 0, 0, 0)`
- **Text Color**: `#131517`
- **Font Size**: `14px`
- **Font Weight**: `400`
- **Height**: `28px`
- **Width**: `28px`
- **Border Radius**: `8px`
- **Border**: `0px`
- **Box Shadow**: `none`
- **Hover**: Background `rgba(255, 255, 255, 0.08)`
- **Active**: Background `rgba(255, 255, 255, 0.12)`

**Button – Badge (NEW/Label)**
- **Background**: `#D1FE17`
- **Text Color**: `#1A1A1A`
- **Font Size**: `11px`
- **Font Weight**: `700`
- **Padding**: `4px 8px`
- **Height**: `20px`
- **Border Radius**: `6px`
- **Text Transform**: `uppercase`
- **Box Shadow**: `none`

**Button – Discount/Trending (Magenta)**
- **Background**: `#FF005B`
- **Text Color**: `#FFFFFF`
- **Font Size**: `11px`
- **Font Weight**: `700`
- **Padding**: `4px 10px`
- **Height**: `24px`
- **Border Radius**: `20px` (fully rounded)
- **Text Transform**: `uppercase`
- **Italic**: `true`
- **Box Shadow**: `none`

### Cards & Containers

**Card – Elevated (Overlay)**
- **Background**: `rgba(0, 0, 0, 0)` (transparent with border only)
- **Text Color**: `#F7F7F8`
- **Font Size**: `16px`
- **Font Weight**: `400`
- **Font Family**: `ui-sans-serif`
- **Padding**: `0px`
- **Border Radius**: `16px`
- **Border**: `1px solid rgba(217, 217, 217, 0.04)`
- **Box Shadow**: `rgba(0, 0, 0, 0.25) 0px 4px 4px 0px`
- **Line Height**: `24px`
- **Hover**: Background `rgba(255, 255, 255, 0.02)`, border `rgba(217, 217, 217, 0.08)`

**Card – Dark (Filled)**
- **Background**: `#0F1113`
- **Text Color**: `#F7F7F8`
- **Font Size**: `16px`
- **Font Weight**: `400`
- **Padding**: `12px 4px`
- **Border Radius**: `0px`
- **Border**: `1px solid rgba(217, 217, 217, 0.04)`
- **Box Shadow**: `none`
- **Line Height**: `24px`

**Card – Content Box (Premium)**
- **Background**: `#1C1E20`
- **Border Radius**: `16px`
- **Padding**: `24px`
- **Border**: `1px solid rgba(217, 217, 217, 0.04)`
- **Box Shadow**: `rgba(209, 254, 23, 0.08) 0px 0px 16px inset`

### Inputs & Forms

**Input – Text**
- **Background**: `#1C1E20`
- **Text Color**: `#F7F7F8`
- **Border**: `1px solid rgba(217, 217, 217, 0.06)`
- **Border Radius**: `8px`
- **Padding**: `8px 12px`
- **Font Size**: `14px`
- **Line Height**: `20px`
- **Focus**: Border color `#D1FE17`, box-shadow `0px 0px 8px rgba(209, 254, 23, 0.3)`
- **Placeholder Color**: `rgba(255, 255, 255, 0.3)`

**Input – Disabled**
- **Background**: `#131517`
- **Text Color**: `rgba(255, 255, 255, 0.2)`
- **Border**: `1px solid rgba(217, 217, 217, 0.02)`
- **Opacity**: `0.5`

**Checkbox / Radio**
- **Size**: `16px × 16px`
- **Border Radius**: `4px` (checkbox) or `50%` (radio)
- **Border**: `1px solid rgba(217, 217, 217, 0.1)`
- **Checked Background**: `#D1FE17`
- **Checked Border**: `#D1FE17`
- **Checked Icon Color**: `#1A1A1A`

### Navigation

**Navigation – Top Bar**
- **Background**: `rgba(19, 21, 23, 0.95)` (with backdrop blur `8px`)
- **Height**: `64px`
- **Border Bottom**: `1px solid rgba(217, 217, 217, 0.02)`
- **Padding**: `0px 20px`
- **Text Color**: `#F7F7F8`
- **Font Size**: `14px`
- **Font Weight**: `400`

**Navigation – Link (Inactive)**
- **Text Color**: `#F7F7F8`
- **Font Size**: `14px`
- **Font Weight**: `400`
- **Padding**: `8px 12px`
- **Hover**: Color `#D1FE17`, background `rgba(209, 254, 23, 0.08)`

**Navigation – Link (Active)**
- **Text Color**: `#D1FE17`
- **Font Weight**: `500`
- **Border Bottom**: `2px solid #D1FE17`
- **Padding Bottom**: `6px`

**Navigation – Logo**
- **Font Size**: `18px`
- **Font Weight**: `700`
- **Color**: `#FFFFFF`
- **Letter Spacing**: `-0.01em`

### Badges & Status

**Badge – Success**
- **Background**: `rgba(83, 197, 70, 0.12)`
- **Text Color**: `#53C546`
- **Border**: `1px solid rgba(83, 197, 70, 0.2)`
- **Border Radius**: `6px`
- **Padding**: `4px 8px`
- **Font Size**: `11px`
- **Font Weight**: `500`

**Badge – Error**
- **Background**: `rgba(231, 41, 48, 0.12)`
- **Text Color**: `#E72930`
- **Border**: `1px solid rgba(231, 41, 48, 0.2)`
- **Border Radius**: `6px`
- **Padding**: `4px 8px`
- **Font Size**: `11px`
- **Font Weight**: `500`

**Badge – Warning**
- **Background**: `rgba(209, 254, 23, 0.12)`
- **Text Color**: `#D1FE17`
- **Border**: `1px solid rgba(209, 254, 23, 0.2)`
- **Border Radius**: `6px`
- **Padding**: `4px 8px`
- **Font Size**: `11px`
- **Font Weight**: `500`

## 5. Layout Principles

### Spacing System

**Base Unit**: `4px`

**Spacing Scale**:
- `4px` — Micro gaps, tight component spacing, icon padding
- `8px` — Small gaps, button padding, list item spacing
- `12px` — Component padding, small section spacing
- `16px` — Standard padding, medium gaps
- `20px` — Gap between sections, grouped components
- `24px` — Section margin, container padding
- `28px` — Large section gaps
- `32px` — Major section spacing, container margins
- `40px` — Extra-large gaps, page section separation
- `48px` — Hero section spacing
- `56px` — Major layout divisions
- `64px` — Full page section separation

**Usage Context**:
- **Buttons**: `8px` horizontal, `4px` vertical (compact); `12px` horizontal, `8px` vertical (standard)
- **Cards**: `24px` padding for content, `16px` for nested sections
- **Inputs**: `8px` horizontal, `8px` vertical padding
- **Navigation**: `20px` horizontal gaps, `12px` vertical gaps

### Grid & Container

**Max Width**: `1440px` (full-width content area with margins)

**Column Strategy**: 
- **Desktop**: 12-column grid with `16px` column gap
- **Tablet**: 6-column grid with `12px` column gap
- **Mobile**: 4-column grid with `8px` column gap

**Container Padding**:
- **Desktop**: `40px` left/right
- **Tablet**: `24px` left/right
- **Mobile**: `16px` left/right

**Section Patterns**:
- **Hero**: Full width, `56px` top/bottom padding, centered content
- **Feature Grid**: 3 columns on desktop, 2 on tablet, 1 on mobile with `20px` gap
- **Content Block**: `1200px` max-width, centered, with `32px` margin top/bottom

### Whitespace Philosophy

Higgsfield AI embraces **generous whitespace** to reduce cognitive load and emphasize key content. Dark backgrounds require more breathing room to prevent fatigue; components are never crowded. Spacing hierarchy mirrors visual hierarchy—important elements receive more surrounding space. Negative space around CTAs (`#D1FE17`) ensures they command attention without visual clutter. Blank areas within cards and containers guide the eye toward actionable content. Section separators use whitespace rather than visible dividers, creating visual pause points.

### Border Radius Scale

- `0px` — No radius; used for full-bleed backgrounds and flat card edges
- `4px` — Minimal radius; for small buttons and tight components
- `6px` — Badge and small accent radius
- `8px` — Standard radius for buttons, inputs, and small containers
- `12px` — Medium radius for some card variations
- `16px` — Large radius for elevated cards and content containers
- `20px` — Extra-large radius for fully rounded buttons (CTA buttons)
- `50%` — Perfect circle for avatar images and circular icon buttons

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (0) | No shadow, no elevation | Backgrounds, base surfaces, typography |
| Raised (1) | `rgba(0, 0, 0, 0.25) 0px 4px 4px 0px` | Card overlays, floating elements |
| Elevated (2) | `rgba(255, 255, 255, 0.03) 0px 2px 3px 0px inset` | Button surfaces, interactive elements |
| Floating (3) | `rgba(24, 220, 255, 0.2) 0px 2px 10px 0px inset, rgba(24, 220, 255, 0.5) 0px -2px 48px 0px inset` | Premium content, neon-accented cards |
| Glow (4) | `rgba(209, 254, 23, 0.48) 0px 0px 0px 0px` (outset glow potential) | Active focus states, lime accent highlights |

**Elevation Philosophy**: Higgsfield AI uses **subtle shadow layering** to create depth without visual heaviness. Inset shadows and neon glows replace traditional drop shadows, maintaining the sleek, modern aesthetic. The primary elevation technique is color contrast—lighter elements pop against dark backgrounds. Glow effects with neon colors (`#D1FE17`, cyan-blue) reserve emphasis for premium or interactive states. Shadows are always soft and minimal (`rgba(0, 0, 0, 0.25)`), never harsh. The system prioritizes **inset lighting** to enhance perceived depth and create a sense of immersion within the interface.

## 7. Do's and Don'ts

### Do
- **Always prioritize contrast**: Use `#FFFFFF` or `#F7F7F8` on all dark backgrounds for maximum readability
- **Leverage neon accents strategically**: Reserve `#D1FE17` and `#FF005B` for high-priority CTAs and status indicators; overuse dilutes impact
- **Use `#D1FE17` for all primary CTAs**: Consistency reinforces brand identity and guides user attention
- **Apply inset shadows for elevation**: Prefer `inset` box shadows and color overlays over external drop shadows
- **Maintain tight, intentional spacing**: Use the spacing scale rigorously; never guess at margin/padding values
- **Scale type hierarchically**: Use Space Grotesk bold (700) for headings, ui-sans-serif regular (400) for body; no mixing
- **Optimize for readability in dark mode**: Increase line height and letter spacing for long-form content
- **Apply subtle hover states**: Add 8% brightness increase or slight background color shift; avoid harsh transitions
- **Use badges consistently**: All "NEW" labels use `#D1FE17`, "TRENDING" use `#FF005B`, error states use `#E72930`
- **Test color combinations for AA/AAA contrast**: Especially for secondary text and muted interactions

### Don't
- **Don't use light colors as primary backgrounds**: Avoid `#F7F7F8` or `#FFFFFF` as card backgrounds without dark borders; violates the dark aesthetic
- **Don't apply hard drop shadows**: Replace with inset shadows or color overlays; hard shadows feel dated
- **Don't mix font families within component labels**: Space Grotesk is for headings/labels, ui-sans-serif for body only
- **Don't over-saturate neon accents**: Limit `#D1FE17` to 3–5 high-priority elements per page to maintain visual hierarchy
- **Don't use red for warnings**: Reserve `#E72930` for errors only; use `#D1FE17` for warnings and caution
- **Don't add borders to every element**: Subtlety is key; use `rgba(217, 217, 217, 0.04)` borders sparingly
- **Don't forget accessibility**: Never rely on color alone to convey status; pair with icons and text labels
- **Don't skip line height**: Minimum `1.5x` font size for all body text; never below `20px` for 14px text
- **Don't create animations without purpose**: Smooth transitions on hover/focus only; avoid auto-playing animations
- **Don't compress or pixelate neon elements**: Render `#D1FE17` and magenta accents at full fidelity for maximum impact

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | `320px–639px` | Single column, 16px padding, 4-column grid, smaller touch targets `40px`, collapsed navigation, stacked cards |
| Tablet | `640px–1023px` | Two column for features, 24px padding, 6-column grid, 44px touch targets, simplified navigation, reduced font sizes |
| Desktop | `1024px–1439px` | Three-column layouts, 40px padding, 12-column grid, 48px touch targets, full navigation, full typography hierarchy |
| Wide | `1440px+` | Max-width containers at `1440px`, centered layout, full-feature navigation, maximum spacing |

### Touch Targets

**Minimum Touch Target Size**: `44px × 44px` (mobile), `40px × 40px` (tablet)

- **Buttons**: Minimum height `44px` on mobile, `40px` on tablet, scalable on desktop
- **Navigation Links**: Minimum `44px` tall on all devices
- **Icon Buttons**: `44px × 44px` on mobile, `40px × 40px` on tablet
- **Form Inputs**: Height minimum `40px` on all devices
- **Checkboxes/Radios**: `18px × 18px` visible size with `8px` padding around for touch area
- **Spacing Between Targets**: Minimum `8px` gap to prevent accidental activation

### Collapsing Strategy

**Mobile-First Adjustments**:
- **Navigation**: Hamburger menu toggle at `< 768px`; horizontal tabs collapse to vertical list
- **Typography**: Heading sizes reduce `16px` per step (e.g., h1 from `48px` → `32px` on mobile)
- **Padding**: Card padding reduces `24px` → `16px`; section padding `40px` → `24px`
- **Grid**: Three-column feature grids collapse to single column; gap reduces from `20px` → `12px`
- **Cards**: Full-width on mobile with side margins; fixed width on tablet+
- **Buttons**: Full-width on mobile for secondary actions; inline on tablet+
- **Images**: Scale to `100%` viewport width on mobile with safe padding; maintain aspect ratios
- **Modals**: Full-screen on mobile, centered box on tablet+
- **Spacing**: Section gaps reduce `56px` → `32px` on mobile
- **Sidebar/Second Column**: Stack vertically on mobile; side-by-side on desktop

**Responsive Typography Adjustments**:
- **Display XL**: `48px` (desktop) → `32px` (tablet) → `24px` (mobile)
- **Display Large**: `36px` (desktop) → `28px` (tablet) → `20px` (mobile)
- **Body Large**: `16px` (all) → `14px` (mobile)
- **Body Regular**: `14px` (all) → `13px` (mobile)

**Tablet-Specific**:
- Two-column layouts for feature grids
- Navigation remains horizontal but with reduced gaps
- Font sizes remain as desktop but with increased line height

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA**: Neon Lime (`#D1FE17`) — all primary buttons and high-priority actions
- **Secondary Accent**: Hot Magenta (`#FF005B`) — discounts, trending badges, secondary emphasis
- **Background Base**: Deep Charcoal (`#0F1113`) or Near-Black (`#131517`) — main surfaces
- **Card Background**: Deep Charcoal (`#1C1E20`) — elevated containers and content areas
- **Text Primary**: Off-White (`#F7F7F8`) — readable body text on dark
- **Text Secondary**: Light Gray (`#D9D9D9`) — muted, secondary content
- **Text Disabled**: Mid Gray (`#B9B9B9`) or `rgba(255, 255, 255, 0.3)` — disabled states
- **Borders**: Subtle Light Gray (`rgba(217, 217, 217, 0.04)`) — minimal separation
- **Success**: Green (`#53C546`) — confirmations and positive states
- **Error**: Red (`#E72930`) — validation failures and destructive actions
- **Warning**: Neon Lime (`#D1FE17`) — cautions and alert conditions

### Iteration Guide

1. **All dark backgrounds use `#131517` or `#0F1113` as base**: No light mode; maintain immersive dark aesthetic
2. **Every interactive element with emphasis uses `#D1FE17`**: Primary buttons, "NEW" badges, active navigation states
3. **Secondary emphasis and urgency use `#FF005B`**: Discount badges, "TRENDING" tags, secondary CTAs
4. **Typography hierarchy is strict**: Space Grotesk bold (700) only for headings/labels; ui-sans-serif regular (400) for all body
5. **All text on dark backgrounds must be `#F7F7F8` or `#FFFFFF` for accessibility**: No exceptions; minimum WCAG AA contrast
6. **Spacing uses the `4px` base unit exclusively**: No random padding; all values are multiples of 4 (`4px`, `8px`, `12px`, `16px`, etc.)
7. **Border radius follows the established scale**: Use `8px` for buttons/inputs, `16px` for cards, `6px` for badges, `0px` for flat surfaces
8. **Shadows are inset or subtle**: Prefer `inset` box shadows and neon glow effects over external drop shadows
9. **Padding inside cards is always `24px` or multiples thereof**: Nested content receives `16px` padding to establish hierarchy
10. **Every button variant has a hover state**: Increase brightness 8%, add background color shift, or apply subtle scale (1.02x)
11. **Navigation links use `#F7F7F8` (inactive) → `#D1FE17` (active)**: Active state includes bottom border
12. **Form inputs have subtle borders**: `1px solid rgba(217, 217, 217, 0.06)` with focus state `box-shadow: 0px 0px 8px rgba(209, 254, 23, 0.3)`
13. **Responsive behavior collapses features systematically**: Grids 3-col → 2-col → 1-col; navigation to hamburger at `< 768px`
14. **Touch targets are minimum `44px × 44px` on mobile, `40px × 40px` on tablet**: Never smaller for accessibility
15. **Glows and elevation use cyan-blue or neon-lime**: `rgba(209, 254, 23, 0.48)` or `rgba(24, 220, 255, 0.5)` for premium effects only