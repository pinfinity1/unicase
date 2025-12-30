# Design System: Apple Aesthetic & Motion Guidelines

## 1. Visual Philosophy: "Clean, Fluid, Premium"

- **Core Vibe:** Minimalist, high use of whitespace, refined typography, and subtle depth.
- **Reference:** Think of Apple Store or Apple Product Pages.
- **Dark/Light:** Heavy reliance on pure black (`#000`) and pure white (`#fff`) with Zinc grays. Avoid saturated colors except for Call-to-Actions (Blue/Black).

## 2. Typography & Layout

- **Font:** `Vazirmatn` (fa) / `Inter` or `Geist` (en).
- **Hierarchy:** Huge headings, small muted subtitles.
- **Spacing:** Be generous. Use `gap-6` or `gap-8` minimum for sections.
- **Radius:**
  - Cards/Containers: `rounded-3xl` (Apple style).
  - Buttons: `rounded-full` (Pill shape).
  - Inputs: `rounded-xl`.

## 3. Material & Depth (The "Apple Glass" Effect)

- **Glassmorphism:** Use heavy backdrop blurs for headers, modals, and floating elements.
  - Class: `bg-background/80 backdrop-blur-xl border-b border-white/10`.
- **Shadows:** Ultra-soft, diffused shadows.
  - Avoid harsh shadows. Use `shadow-sm` or custom diffuse shadows.
- **Borders:** Subtle, 1px borders using `border-zinc-200` (light) or `border-zinc-800` (dark).

## 4. Motion & Animation (Motion.dev)

_We use `framer-motion` (motion.dev) for all interactions._

### 4.1. Standard Transitions

- **Page Load:** Content should gently "fade in and slide up".
- **Hover:** Elements should scale slightly (`scale-105`) with a spring transition.
- **Active (Click):** Elements should scale down (`scale-95`).

### 4.2. Animation Rules (Copy-Paste Logic)

- **Spring Physics:** ALWAYS use spring transition for natural feel.
  ```tsx
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
  ```
