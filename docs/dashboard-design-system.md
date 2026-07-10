# Career Intelligence Dashboard Design System Documentation

This document details the Squarespace-inspired design system implemented for the **Career Intelligence Dashboard** of the AI Career Intelligence Engine (ACIE).

---

## 1. Aesthetic Philosophy

The visual layout focuses on a high-end luxury, hyper-minimalist approach:
- **Generous Whitespace**: Focuses the student's attention on core scores without dashboard clutter.
- **Deep Contrast**: Utilizes stark black ink elements against off-white canvases for clean visual hierarchy.
- **Micro-Hover Scaling**: Smooth fluid interactions indicating card responsiveness.

---

## 2. Style Tokens Reference

### Color Palette
- **Canvas Base Background**: `#FBFBF9` (Premium Studio Off-White)
- **Primary Ink Black**: `#111111` (Headings, primary buttons, and target blocks)
- **Muted Body Text**: `#555555`
- **Subtle borders**: Thin boundaries using `rgba(17, 17, 17, 0.07)` for card elements and sections.

### Typography (Plus Jakarta Sans)
- **Headings (h1, h2, h3)**: `font-weight: 500` or `600`, line-height: `1.1`, tracking-tight: `letter-spacing: -0.03em`.
- **Body & Labels**: `font-weight: 400`, color `#444444` / `#555555`, line-height: `1.6`.

---

## 3. GSAP Interaction & Lifecycle Hooks

To enable smooth, high-fidelity movements, the dashboard leverages the **GSAP Animation Engine** integrated directly into React's lifecycle hooks.

### 3.1 Staggered Page Entrance
When career metrics load successfully, containers tagged with `.luxe-animate` trigger a staggered slide-up sequence:
```javascript
gsap.from(".luxe-animate", {
  opacity: 0,
  y: 40,
  duration: 1.2,
  stagger: 0.12,
  ease: "power4.out"
});
```

### 3.2 Numerical Count-Up Interpolation
For the IRS, CCI, and CRS percentages, a numerical value interpolator tweens values dynamically from `0` to target values:
```javascript
const animateCount = (id, target) => {
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration: 1.8,
    ease: "power3.out",
    onUpdate: () => {
      const el = document.getElementById(id);
      if (el) el.innerText = Math.round(obj.val);
    }
  });
};
```

### 3.3 Dynamic Mouse Hover Handling
Hovering over metrics cards scales the container, shifts indicators, and deepens drop-shadow depths:
- **Card Scaling**: Tweens scale smoothly from `1.0` to `1.012`.
- **Arrow Offsets**: Shifts arrows by `x: 5`.
- **Shadow Adjustment**: Transitions border colors and shadows seamlessly using GSAP.
