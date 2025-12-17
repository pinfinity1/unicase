# Project Context: UniCase

## 1. Tech Stack & Architecture

- **Framework:** Next.js 15+ (App Router, Server Actions, TurboPack)
- **Database:** PostgreSQL + Prisma ORM
- **State Management:** Zustand (Client Side), React Query (Server Side Optional)
- **Styling:** Tailwind CSS v4
- **Auth:** NextAuth.js v5 (Auth.js)
- **Validation:** Zod

## 2. Design System: "Liquid Glass Protocol"

- **Aesthetic:** iOS 26 Concept / Futuristic Apple.
- **Core Engine:** Global SVG filters implemented in `src/components/ui/glass-effects.tsx`.
- **Primary Utility:** `.glass-prism` (Refractive, chromatic aberration glass).
- **Visual Rules:**
  - **No Flat Design:** Every container must have depth, blur, or refraction.
  - **Shapes:** Strict usage of Squircles (`rounded-2xl`, `rounded-3xl`, `rounded-full`).
  - **Motion:** Physics-based animations (Spring physics).
  - **Typography:** Clean, legible, high contrast inside glass containers.

## 3. Scope & Release Standard (The "Full Store" Rule)

> **Principle:** The project is defined as "Launch Ready" (Phase 1) ONLY when all modules below are functional. Any missing item is considered a critical bug.

### 📦 Module A: Admin Panel

- [ ] **Dashboard:** High-level analytics.
- [ ] **Product CRUD:** - Multi-image upload (S3/MinIO).
  - Color & Variant management.
  - Inventory control per variant.
- [ ] **Brand & Category Management.**
- [ ] **Site Settings:**

### 👤 Module B: User Profile (Client Area)

- [ ] **Dashboard:** Recent activity summary.
- [ ] **Order History:** List of orders with status (Processing, Delivered, etc.).
- [ ] **Address Book:** - CRUD operations for user addresses.
  - Set "Default" address.
- [ ] **Wishlist:** Save products for later.

### 💳 Module C: Checkout & Payment

- [ ] **Smart Checkout:** Select from "Saved Addresses" (No repetitive typing).
- [ ] **Shipping Engine:** - Admin defined shipping methods (e.g., Post, Tipax).
  - Dynamic cost calculation added to total price.
- [ ] **Payment Gateway:** ZarinPal integration with **Transaction Logging** (Payment Table).
- [ ] **Stock Reservation:** Prevent overselling during payment redirection.

### 🚀 Module D: SEO & Growth

- [ ] **Metadata:** Dynamic Title/Description for every product/category.
- [ ] **OpenGraph:** Dynamic OG Images for social sharing.
- [ ] **Structured Data:** JSON-LD for Products, Breadcrumbs, and Organization.
- [ ] **Sitemap:** Auto-generated `sitemap.xml`.

---

_This document serves as the single source of truth for the UniCase architecture._
