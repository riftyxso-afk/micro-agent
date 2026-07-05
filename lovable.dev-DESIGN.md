# Design System Inspired by Lovable

## 1. Visual Theme & Atmosphere

Lovable embodies a modern, vibrant aesthetic that celebrates creativity and AI-powered innovation. The design system features bold gradient backgrounds that transition from cool blues through vibrant magentas to warm oranges, creating an energetic and forward-thinking visual language. The atmosphere is welcoming yet professional, balancing playful color dynamics with clean, minimalist interfaces. Typography is refined and spacious, allowing content to breathe while maintaining strong visual hierarchy. The overall impression is of a cutting-edge platform that makes complex AI technology feel accessible, approachable, and genuinely delightful to use.

**Key Characteristics**
- Vibrant gradient color transitions (blue → magenta → orange)
- Clean, minimal interface with generous whitespace
- Modern sans-serif typography with variable weights
- Sophisticated layering through subtle shadows and elevation
- Accessible contrast ratios with intentional color semantics
- Smooth interactions and refined component styling

## 2. Color Palette & Roles

### Primary
- **Primary Brand** (`#1F55F1`): Accent color for interactive elements, links, and key CTAs; represents the core brand identity
- **Primary Accent** (`#8E48FF`): Secondary brand accent for special highlights and decorative elements
- **Background Neutral** (`#ECEAE4`): Dominant neutral background used across layouts (487 instances)

### Accent Colors
- **Vibrant Magenta** (`#E12429`): Used for error states and attention-grabbing alerts
- **Warm Orange** (`#CE4700`): Alternative error state and warm accent variant
- **Success Green** (`#209928`): Positive confirmation states and success messaging
- **Gradient Support — Purple** (`#8E48FF`): Part of gradient progressions for visual interest
- **Deep Navy** (`#091A48`): Dark accent for contrast-heavy designs

### Interactive
- **Dark Button** (`#030303`): Primary button backgrounds for high contrast CTAs
- **Light Text on Dark** (`#FFFFFF`): Foreground text on dark interactive elements
- **Ghost/Transparent** (`#000000` with `rgba(0, 0, 0, 0)`): Invisible backgrounds for ghost button variants

### Neutral Scale
- **Text Primary** (`#030303`): Main body text and primary copy
- **Text Secondary** (`#1C1C1C`): Slightly lighter text for secondary information
- **Text Tertiary** (`#777771`): Muted text for captions and hints
- **Pure White** (`#FFFFFF`): Clean surfaces and high-contrast backgrounds
- **Off-White** (`#F7F4ED`): Subtle background tint for card surfaces

### Surface & Borders
- **Border Default** (`#E7E7E6`): Light borders on subtle surfaces
- **Card Background** (`#FFFFFF`): Clean card and container surfaces
- **Surface Beige** (`#ECEAE4`): Warm neutral for page backgrounds and large surfaces

### Semantic / Status
- **Error** (`#E12429`): Critical alerts and validation failures
- **Error Alternative** (`#CE4700`): Secondary error indicators
- **Success** (`#209928`): Positive actions and confirmations

## 3. Typography Rules

### Font Family
**Primary Font:** Camera Plain Variable  
Fallback stack: `'Camera Plain Variable', system-ui, -apple-system, sans-serif`

**Usage:** All headings, body text, buttons, links, and interface copy use the Camera Plain Variable family, providing consistent visual voice across all scales.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / H1 | Camera Plain Variable | 20px | 400 | 30px | Normal | Large page titles and hero headlines |
| Heading / H2 | Camera Plain Variable | 48px | 600 | 48px | Normal | Major section headers |
| Subheading / H3 | Camera Plain Variable | 36px | 600 | 39.6px | Normal | Section dividers and large subsections |
| Body / P | Camera Plain Variable | 16px | 400 | 24px | Normal | Default paragraph text |
| Button / Label | Camera Plain Variable | 14px | 400 | 21px | Normal | Button labels and small UI text |
| Link / Secondary | Camera Plain Variable | 14px | 480 | 21px | Normal | Hyperlinks and navigation items |
| Caption / Small | Camera Plain Variable | 14px | 400 | 21px | Normal | Captions, hints, and helper text |
| List Item | Camera Plain Variable | 16px | 400 | 24px | Normal | Bulleted and ordered list content |

### Principles
- **Weight progression:** Use 400 for body and UI, 480 for links, 600 for headings to create clear hierarchy
- **Line height:** Maintain 1.5x multiplier (16px text gets 24px line height) for readability
- **Spacing:** Pair typography with generous margins (`40px`, `48px`, `56px`) to prevent visual clutter
- **Contrast:** Ensure minimum WCAG AA contrast between text and backgrounds
- **Scalability:** Font sizes increase moderately; avoid extreme jumps between scales

## 4. Component Stylings

### Buttons

#### Primary Button
- **Background:** `#030303`
- **Text Color:** `#FFFFFF`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Padding:** `6px 10px`
- **Border Radius:** `8px`
- **Border:** None
- **Height:** `32px`
- **Line Height:** `21px`
- **Hover State:** Background opacity reduced to `0.85`, slight scale up (`transform: scale(1.02)`)
- **Active State:** Background darkened to `#000000`, slight scale down (`transform: scale(0.98)`)
- **Disabled State:** Opacity `0.5`, cursor not-allowed

#### Secondary Button
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#030303`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Padding:** `6px 10px`
- **Border Radius:** `8px`
- **Border:** `1px solid #E7E7E6`
- **Height:** `32px`
- **Line Height:** `21px`
- **Hover State:** Background `#F7F4ED`, border color `#ECEAE4`
- **Active State:** Background `#ECEAE4`, border color `#777771`
- **Disabled State:** Opacity `0.5`, cursor not-allowed

#### Ghost Button
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#030303`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Padding:** `8px 8px`
- **Border Radius:** `0px`
- **Border:** None
- **Height:** `auto`
- **Line Height:** `24px`
- **Hover State:** Underline appears on text (`border-bottom: 1px solid #030303`), subtle background tint
- **Active State:** Text color darkens to `#000000`, underline thickness increases

#### Get Started Button (CTA)
- **Background:** `#1C1C1C`
- **Text Color:** `#FFFFFF`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Padding:** `10px 20px`
- **Border Radius:** `6px`
- **Border:** None
- **Height:** `40px`
- **Line Height:** `21px`
- **Hover State:** Background becomes `#1F55F1`, shadow elevation increases to `md`
- **Active State:** Background `#030303`, transform `scale(0.98)`

### Cards & Containers

#### Default Card
- **Background:** `#FFFFFF`
- **Border:** `1px solid #E7E7E6`
- **Border Radius:** `12px`
- **Padding:** `24px`
- **Shadow:** `md` (complex multi-layer shadow — see Elevation section)
- **Text Color:** `#030303`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Line Height:** `24px`
- **Hover State:** Shadow elevation increases, border opacity increases, subtle scale (`transform: scale(1.01)`)
- **Min Width:** `262px`

#### Feature Card
- **Background:** `linear-gradient(135deg, rgba(31, 85, 241, 0.08), rgba(142, 72, 255, 0.08))`
- **Border:** `1px solid #E7E7E6`
- **Border Radius:** `12px`
- **Padding:** `24px`
- **Shadow:** `sm` (subtle)
- **Text Color:** `#030303`
- **Heading Color:** `#1F55F1`
- **Min Height:** `200px`

#### Container / Section
- **Background:** `#ECEAE4`
- **Border Radius:** `12px`
- **Padding:** `32px 24px` to `80px 48px` depending on context
- **Max Width:** `1200px` (centered)
- **Margin:** `0 auto`
- **Box Shadow:** `sm` or none for subtle surface

### Inputs & Forms

#### Text Input
- **Background:** `#FFFFFF`
- **Border:** `1px solid #E7E7E6`
- **Border Radius:** `8px`
- **Padding:** `12px 16px`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Line Height:** `24px`
- **Text Color:** `#030303`
- **Placeholder Color:** `#777771`
- **Height:** `40px`
- **Focus State:** Border color changes to `#1F55F1`, shadow adds `0 0 0 3px rgba(31, 85, 241, 0.1)`
- **Error State:** Border color `#E12429`, background tint `rgba(225, 36, 41, 0.05)`
- **Disabled State:** Background `#F7F4ED`, text color `#777771`, cursor not-allowed

#### Textarea
- **Background:** `#FFFFFF`
- **Border:** `1px solid #E7E7E6`
- **Border Radius:** `8px`
- **Padding:** `12px 16px`
- **Font Size:** `14px`
- **Font Weight:** `400`
- **Line Height:** `21px`
- **Min Height:** `100px`
- **Resize:** Vertical only
- **Focus State:** Border color `#1F55F1`, shadow `0 0 0 3px rgba(31, 85, 241, 0.1)`

#### Label
- **Font Size:** `14px`
- **Font Weight:** `600`
- **Color:** `#030303`
- **Margin Bottom:** `8px`
- **Display:** Block

### Navigation

#### Header Navigation
- **Background:** `#FFFFFF`
- **Height:** `64px`
- **Padding:** `0 24px`
- **Flex Display:** `flex`, `align-items: center`, `justify-content: space-between`
- **Border Bottom:** `1px solid #E7E7E6`
- **Shadow:** `sm`

#### Nav Link
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Color:** `#030303`
- **Padding:** `8px 16px`
- **Border Radius:** `4px`
- **Hover State:** Background `#F7F4ED`, color unchanged
- **Active State:** Color `#1F55F1`, underline `2px solid #1F55F1`

#### Dropdown / Submenu
- **Background:** `#FFFFFF`
- **Border:** `1px solid #E7E7E6`
- **Border Radius:** `8px`
- **Padding:** `8px 0`
- **Shadow:** `md`
- **Min Width:** `180px`
- **Z-Index:** `1000`

## 5. Layout Principles

### Spacing System

**Base Unit:** `4px`

**Scale:**
- `4px` — Micro gaps between inline elements
- `8px` — Tight spacing, small component gaps
- `12px` — Input padding, button internal spacing
- `16px` — Standard component padding, moderate gaps
- `20px` — Card padding, standard margins
- `24px` — Section padding, heading margins
- `32px` — Large section padding, content margins
- `40px` — Between major sections
- `48px` — Between sections on full pages
- `56px` — Large section separations
- `80px` — Hero section padding
- `128px` — Page-level spacing, top/bottom sections

**Context:**
- **Buttons:** `6px 10px` (vertical/horizontal padding)
- **Cards:** `24px` standard, `32px–80px` for container sections
- **Form Fields:** `12px 16px` padding
- **Navigation:** `8px 16px` per link item
- **Text:** `40px–128px` margin between blocks to create breathing room

### Grid & Container

- **Max Width:** `1200px` for main content containers
- **Centered Layout:** `margin: 0 auto` on all constrained sections
- **Column Strategy:** 
  - Mobile (< 768px): Single column, full width with `16px` gutters
  - Tablet (768px–1024px): Two-column grid with `24px` gap
  - Desktop (1024px+): Three-column grid with `24px` gap, or flexible two-column for features
- **Hero Section:** Full-width background with `1200px` max-width centered content overlay
- **Padding Around Edges:** `24px` on small screens, `40px` on desktop

### Whitespace Philosophy

Lovable's design prioritizes generous whitespace to reduce cognitive load and highlight key content. Large vertical margins (`40px–128px`) separate major sections, creating natural visual breaks. Horizontal padding ensures text never touches screen edges. Card interiors use `24px` padding minimum, expanding to `32px–48px` for prominent content. This spacious approach reflects the platform's focus on clarity and user comfort — nothing feels cramped or overwhelming.

### Border Radius Scale

- `0px` — Navigation bars, full-width sections, minimal components
- `4px` — Subtle button underlines and small UI elements
- `6px` — Small buttons, secondary CTAs, links
- `8px` — Primary buttons, form inputs, standard components
- `12px` — Cards, containers, feature blocks
- `3.35544e+07px` — Fully rounded buttons (pill shape for very specific CTA buttons)

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (No Shadow) | `box-shadow: none` | Navigation bars, page backgrounds, minimal sections |
| Subtle (sm) | `rgba(247, 244, 237, 0.008) 0px -0.00702258px 0px 0px inset` | Slight depth for inactive cards or secondary content |
| Elevated (md) | `rgb(255, 255, 255) 0px 0px 0px 1px, lab(98.2716 0 0) 0px 0px 0px 1px, rgba(119, 119, 113, 0.16) 0px 0px 0px 2px, rgba(0, 0, 0, 0.04) 0px 2px 1px 0px, rgba(0, 0, 0, 0.04) 0px 2px 1px -0.5px, rgba(0, 0, 0, 0.04) 0px 4px 3px -1.5px, rgba(0, 0, 0, 0.04) 0px 7px 6px -3px, rgba(0, 0, 0, 0.04) 0px 13px 12px -6px, rgba(0, 0, 0, 0.04) 0px 25px 24px -12px` | Primary cards, active buttons, overlays, modals |
| Interactive Hover | Increase `md` shadow opacity by 20%, add subtle `transform: translateY(-2px)` | Elevated cards on hover, active navigation items |

**Shadow Philosophy:** Lovable uses layered, complex shadows with minimal opacity to create refined depth without heaviness. Shadows employ multiple blur and spread values, creating a nuanced lighting model that suggests three-dimensional layering. The approach is sophisticated and modern, avoiding stark drops or harsh contrasts. Shadows increase subtly on hover and focus states, providing tactile feedback without overwhelming the interface.

## 7. Do's and Don'ts

### Do
- Use the primary color (`#1F55F1`) to highlight key interactive elements and CTAs
- Apply generous whitespace (`40px–128px`) between major content sections for visual breathing room
- Pair typography weights intentionally: `400` for body, `600` for headings, `480` for links
- Implement the full `md` shadow stack on elevated elements (cards, modals, active buttons) for authentic depth
- Test all color combinations against WCAG AA contrast standards for accessibility
- Use `#030303` for primary buttons and `#FFFFFF` for text on dark backgrounds
- Apply rounded corners (`8px–12px`) to all interactive components for a modern, approachable feel
- Layer gradient overlays (blue → magenta → orange) on hero and feature sections
- Reserve error colors (`#E12429`, `#CE4700`) strictly for validation, errors, and alerts
- Keep images and decorative elements at `12px` border radius for visual consistency

### Don't
- Mix font families; Camera Plain Variable is the exclusive typeface
- Apply shadows to navigation, full-width sections, or flat backgrounds
- Use pure black (`#000000`) or pure white (`#FFFFFF`) for body text; stick to `#030303` for text and `#ECEAE4` for backgrounds
- Create components smaller than `32px` in height for buttons and interactive elements (touch target minimum)
- Overuse accent colors (`#1F55F1`, `#8E48FF`); reserve them for emphasis and interactivity
- Apply borders thicker than `1px` on cards and containers
- Use line heights below `1.5x` the font size (e.g., `16px` text requires minimum `24px` line height)
- Place text directly on gradient backgrounds without a semi-transparent overlay or enough contrast
- Exceed max-width of `1200px` for main content containers
- Apply transparency to semantic colors; use full opacity for status indicators (green, red, orange)

## 8. Responsive Behavior

### Breakpoints

| Breakpoint Name | Width | Key Changes |
|-----------------|-------|-------------|
| Mobile | 320px–767px | Single-column layout, `16px` horizontal padding, `24px` vertical spacing, 100% component widths |
| Tablet | 768px–1023px | Two-column grid (50% / 50%), `24px` padding, `32px` gaps, medium button sizes |
| Desktop | 1024px–1440px | Three-column grid or two-column feature layout, `32px–48px` padding, `24px–32px` gaps, full-size typography |
| Large Desktop | 1440px+ | Max-width enforced (`1200px`), centered layout, generous padding (40px–80px), all typography at 100% scale |

### Touch Targets

- **Minimum Interactive Element Height:** `32px` (buttons, inputs, links)
- **Minimum Interactive Element Width:** `32px` (square buttons, icon buttons)
- **Minimum Tap Area:** `44px × 44px` for mobile devices
- **Spacing Between Touch Targets:** Minimum `8px` horizontal, `8px` vertical gap to prevent accidental activation
- **Button Padding:** Mobile buttons: `12px 20px` (larger than desktop `6px 10px`)
- **Link Target:** Minimum `16px` line height for standalone links

### Collapsing Strategy

**Mobile (< 768px):**
- Stack all navigation to a vertical menu or hamburger drawer
- Display hero section text at `20px` (h1) instead of `48px` (h2)
- Single-column card grids; cards expand to 100% width
- Reduce padding in containers to `16px`, margins to `24px–32px`
- Collapse multi-column features into single column, stacking blocks vertically
- Buttons expand to full width in forms
- Reduce section padding (`80px` desktop → `32px` mobile)

**Tablet (768px–1023px):**
- Navigation remains horizontal with adjusted font sizes
- Two-column grid for cards and features
- Padding increases to `24px` in containers
- Typography remains consistent; line heights maintain `1.5x` ratio
- Spacing between sections: `40px–48px` vertical margins

**Desktop (1024px+):**
- Full three-column grid capability
- Navigation fully expanded with hover states active
- Typography at all standard sizes (`20px`, `36px`, `48px`)
- Padding and margins at maximum recommended values
- Shadows (md) fully rendered on all elevated elements

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA:** `#030303` background, `#FFFFFF` text
- **Secondary CTA:** `#FFFFFF` background, `#030303` text, `1px solid #E7E7E6` border
- **Accent Highlight:** `#1F55F1` for links and interactive underlines
- **Success State:** `#209928`
- **Error State:** `#E12429`
- **Warning State:** `#CE4700`
- **Heading Text:** `#030303`
- **Body Text:** `#030303`
- **Secondary Text:** `#777771`
- **Background:** `#ECEAE4` (default page), `#FFFFFF` (cards)
- **Borders:** `#E7E7E6` on `#FFFFFF` surfaces, `#E7E7E6` on `#ECEAE4` surfaces
- **Gradient (Hero):** Linear gradient `135deg` from `#1F55F1` (top-left) through `#8E48FF` (center) to `#CE4700` (bottom-right)

### Iteration Guide

1. **Typography First:** All text uses Camera Plain Variable; headings are `600` weight, body is `400`, links are `480`. Line heights are always `1.5x` font size. Pair sizes from the provided hierarchy table — no arbitrary font sizes.

2. **Spacing Discipline:** Use only values from the scale (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `56px`, `80px`, `128px`). Buttons get `6px 10px` padding; cards get `24px`; sections get `40px–128px` margins.

3. **Color Semantics:** Primary buttons are dark (`#030303`); secondary buttons are light with borders (`#FFFFFF` background, `#E7E7E6` border). Accent interactive elements use `#1F55F1`. Error states use `#E12429`. Always maintain contrast above WCAG AA.

4. **Elevation & Shadows:** Apply `md` shadow only to cards, modals, and elevated interactive elements. Use `sm` for subtle depth on inactive variants. Flat backgrounds (navigation, full-width sections) have no shadow. Shadows are complex multi-layer stacks — copy the exact values from the Elevation section.

5. **Border Radius:** Buttons and inputs are `8px`. Cards and containers are `12px`. Ghost elements and navigation are `0px`. Pill-shaped buttons (rare CTAs) use `3.35544e+07px` (maximum rounding).

6. **Responsive Adaptation:** Mobile layouts are single-column with `16px` padding. Tablet is two-column with `24px` padding. Desktop uses three-column grids and full spacing scales. Always test button sizes; they must be at least `32px` tall on all devices. Text scales slightly on mobile (e.g., `36px` h3 becomes `24px` on mobile).

7. **Interactive States:** Buttons have `hover` (opacity/scale), `active` (slight scale-down), and `disabled` (reduced opacity, cursor not-allowed) states. Links on hover show underline. Cards elevate slightly on hover with shadow increase. Forms show blue focus ring (`0 0 0 3px rgba(31, 85, 241, 0.1)`) on inputs.

8. **Component Consistency:** Every button variant (`primary`, `secondary`, `ghost`, `CTA`) is defined with exact CSS. Cards are `12px` radius with `1px borders` and full `md` shadows. Navigation is horizontal on desktop, drawer on mobile. Inputs are `40px` tall with `12px 16px` padding.

9. **Brand Expression:** Leverage gradients on hero sections (blue → magenta → orange). Use whitespace aggressively to communicate luxury and clarity. Every interactive element is slightly rounded and subtly elevated. The tone is modern, approachable, and confident — the interface celebrates AI innovation without feeling cold or technical.