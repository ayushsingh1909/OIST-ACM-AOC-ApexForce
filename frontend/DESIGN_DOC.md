# ACIE - AI Career Intelligence Engine (Frontend Design System)

## Overview
This document outlines the visual and architectural design principles used for the frontend of the ACIE platform. The UI has been completely refactored to align with a premium, highly-editorial aesthetic, drawing structural and visual inspiration from high-end design languages like Squarespace.

## Core Aesthetic Principles
The platform adopts a stark, high-contrast, black-and-white visual identity. The design relies entirely on typography, spacing, and sharp geometric edges to create hierarchy, discarding conventional soft UI patterns like rounded corners, drop shadows, and saturated color fills.

1. **Monochrome Dominance:** The interface is built on absolute black (`#000000`) and pure white (`#FFFFFF`), with grayscale used sparingly (`black/10` for borders, `black/60` for secondary text).
2. **Sharp Geometry:** No rounded corners (`border-radius: 0`). All cards, inputs, buttons, and containers have sharp, 90-degree angles.
3. **Typography as Interface:** The design uses large, confident typography to define sections. "Plus Jakarta Sans" serves as the primary typeface for its geometric, editorial feel. 
4. **Deliberate Whitespace:** Generous padding and margins (`p-8`, `p-10`) allow content to breathe, avoiding visual clutter.
5. **Utilitarian Borders:** Simple 1px solid borders (`border-black/10`) are used to divide space and define boundaries without relying on drop shadows.

## Typography
- **Primary Typeface:** `Plus Jakarta Sans`, fallback to sans-serif.
- **Headings (h1, h2, h3):** Heavy weights (`font-bold`, `font-extrabold`), tight tracking (`tracking-tighter`), pure black (`#000000`).
- **Labels / Microcopy:** Small size (`text-[10px]`, `text-xs`), stark uppercase (`uppercase tracking-widest`), pure black or very dark gray.
- **Links:** Black, bold, with sharp underlines (`underline decoration-1 underline-offset-2`).

## Component Specifications

### Layout Structure
- **Sidebar:** Clean, border-right division (`border-r border-black/10`). Active states are marked by inverted colors (black background, white text) rather than colored highlights or borders.
- **Main Content:** Expansive white canvas. Max-width containers (`max-w-6xl`) used to keep content readable.

### Cards
- **Base Style:** `bg-[#FFFFFF] border border-black/10`. No shadows.
- **Internal Spacing:** Generous padding (`p-6` or `p-8`).
- **Interactive States:** Hover effects rely on subtle background shifts (e.g., `hover:bg-black/5`) or border darkening, never on shadow expansion or scaling.

### Forms & Inputs
- **Inputs:** `bg-[#FFFFFF] border border-black/20 text-[#000000]`. Sharp corners. Focus state replaces colored rings with a harsh black border/ring (`focus:ring-1 focus:ring-black focus:border-black`).
- **Labels:** Uppercase, wide tracking, small font (`text-[10px] uppercase tracking-widest`).

### Buttons
- **Primary Actions:** Solid black (`bg-[#000000]`), white text (`text-[#FFFFFF]`), sharp edges (`rounded-none`). Hover state slightly dims opacity (`hover:bg-[#000000]/80`).
- **Secondary Actions:** Outline buttons with solid black borders (`border border-black`), transparent background, black text.

## Motion & Interaction (GSAP)
Animations are restrained and purposeful:
- **Page Transitions:** Quick, harsh fade-ins or slight vertical reveals.
- **Staggered Lists:** Content appears sequentially with a fast, sharp ease.
- **Avoid:** Bouncy springs, slow morphs, or anything that contradicts the rigid, architectural feel of the layout.

## Tailwind Configuration (v4)
The aesthetic is enforced globally via `index.css` using Tailwind v4 `@theme` directives, stripping out default radii and configuring the core monochrome palette:
```css
@theme {
  --font-sans: "Plus Jakarta Sans", sans-serif;
  --radius-sm: 0px;
  --radius-md: 0px;
  --radius-lg: 0px;
  --radius-xl: 0px;
  --radius-2xl: 0px;
  --radius-3xl: 0px;
  /* ... */
}
```

## Conclusion
This stark, editorial design language ensures ACIE feels like a professional, enterprise-grade intelligence platform rather than a generic SaaS dashboard. Consistency in typography and restraint in color and border radii are critical to maintaining this visual standard.
