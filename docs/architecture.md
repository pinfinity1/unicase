# System Architecture & Technical Design (Unicase)

## 1. High-Level Architecture

Unicase is a generic e-commerce platform designed for the Iranian market, featuring a **Server-Centric** architecture using Next.js 15 App Router.

- **Frontend:** Server Components (RSC) for data fetching, Client Components for interactivity.
- **Backend:** Integrated via **Server Actions** (RPC-style) instead of REST APIs.
- **Database:** PostgreSQL managed by Prisma ORM.
- **State Strategy:** URL-driven state for filters/search, Server State (React Query/RSC) for data, and minimal Client State (Zustand) for Cart/UI.

## 2. Directory Structure (Master Plan)

The project follows a **Vertical Slice** architecture tailored for Domain-Driven Design.

### 2.1. App Router (`src/app`)

- **`(main)`**: Public Storefront

  - `page.tsx`: Landing Page (Hero, Bestsellers, SEO Content).
  - **`products/`**:
    - `page.tsx`: **All Products Listing** (Filters, Pagination).
    - `[slug]/page.tsx`: **Product Details** (Gallery, Specs, Add to Cart).
  - **`category/`**:
    - `[slug]/page.tsx`: **Category Page** (e.g., /category/phones).
  - `cart/page.tsx`: Shopping Cart.
  - `search/page.tsx`: Search Results.
  - **`profile/`**: User Dashboard
    - `page.tsx`: Overview.
    - `orders/`: Order History.
    - `addresses/`: Address Management.
    - `wishlist/`: Saved Items.
    - `reviews/`: User's Reviews History.

- **`(auth)`**: Authentication

  - `login/page.tsx`: Unified Auth Flow (Phone -> OTP).

- **`checkout/`**: Transaction Flow

  - `page.tsx`: Shipping & Payment Selection.
  - `success/[orderId]/page.tsx`: Receipt & Success Message.

- **`payment/`**:

  - `verify/page.tsx`: Callback Handler for Gateways.

- **`admin/`**: Back-Office Operations
  - `page.tsx`: Dashboard Overview.
  - **Catalog Management:**
    - `products/`: CRUD, Variants, Images.
    - `categories/`: Tree Management.
    - `brands/`: Manufacturers.
    - `inventory/`: Dedicated Stock Adjustments.
  - **Sales & Users:**
    - `orders/`: Order Processing.
    - `users/`: Customer Management.
  - **Growth & Marketing:**
    - `marketing/`: Coupons & Campaigns.
    - `reviews/`: Moderation Queue.
  - **Configuration:**
    - `shipping/`: Shipping Rules.
    - `settings/`: Global Config (Currency, SEO).

### 2.2. Data & Logic Layer (`src/actions`)

All database mutations (Server Actions):

- **Core:** `products.ts`, `orders.ts`, `cart.ts`, `auth.ts`, `users.ts`.
- **Catalog:** `categories.ts`, `brands.ts`.
- **Operations:** `shipping.ts`, `settings.ts`.
- **Growth:**
  - `marketing.ts`: Coupon validation logic.
  - `reviews.ts`: Submit & Approve reviews.
  - `analytics.ts`: Dashboard chart data.

### 2.3. UI Component Library (`src/components`)

- **`ui/`**: **Atomic Primitives** (Shadcn UI: Button, Input, Sheet, etc.).
- **Domain Modules (Admin):**
  - `admin/products/`: Forms, Uploaders.
  - `admin/marketing/`: Coupon Generators.
  - `admin/reviews/`: Moderation Tables.
  - `admin/inventory/`: Stock Grid.
- **Domain Modules (Storefront):**
  - `home/`: Hero, Banners, Lucky Offers.
  - `product/`: Cards, Gallery, Specs.
  - `catalog/`: Filter Sidebar, Sort Dropdown.
  - `reviews/`: Star Rating Input, Comment List.
  - `cart/`: Cart items, Summary.
  - `checkout/`: Shipping forms, Gateway selector.
  - `profile/`: User sidebar, Address cards.

### 2.4. Core Utilities (`src/lib`)

- **`db.ts`**: Global Prisma Client singleton.
- **`payment/`**: **Adapter Pattern** (Abstracting Zarinpal).
- **`s3.ts`**: Object storage handler.
- **`validations/`**: Zod schemas (Shared).

## 3. Data Model (Prisma Schema Overview)

The database is the **Single Source of Truth**. Key domains:

- **Product Domain:**
  - `Product` 1-n `ProductVariant`.
  - `Product` m-n `Category` & `Brand`.
  - `Product` m-n `TargetDevice` (Generic Compatibility).
- **Sales Domain:**
  - `Cart` & `CartItem`: Persistent server-side cart.
  - `Order` & `OrderItem`: Immutable snapshot.
  - `Payment`: Transaction logs.
- **Growth Domain:**
  - `Coupon`: Discount rules.
  - `Review`: Verified user feedback.
  - `Wishlist`: User saved items.
- **User Domain:**
  - `User`, `Role`, `Address`, `VerificationToken`.

## 4. Key Workflows & Patterns

### A. Authentication (Phone-First & Password-Optimized)

1. **Lookup:** User enters phone -> `actions/auth.ts` checks existence.
2. **Existing User:**
   - System recognizes user -> Prompts for **Password** -> Login.
   - (Option to reset password via OTP if forgotten).
3. **New User:**
   - System detects new phone -> Prompts to **Set Password** first.
   - Triggers **OTP** SMS.
   - User enters OTP -> Verifies ownership -> Account Created & Verified (Status: ACTIVE).
4. **Session:** Managed by **Auth.js (v5)** (JWT Strategy).

### B. Cart System (Hybrid)

- Database-backed for persistence.
- Merges Guest Cart (Cookie) to User Cart on login.

### C. Payment Flow (Adapter Pattern)

- `actions/payment.ts` handles provider selection.
- Order Status: `PENDING` -> `PAID` (Stock Deducted) -> `PROCESSING`.

### D. Concurrency Control

- Stock is locked **ONLY** at `INITIATE_PAYMENT`.
- Uses DB Transactions to prevent overselling.

## 5. Security & Validation

- **RBAC:** Admin routes protected via Middleware.
- **Zod:** Strict input validation for all Actions.
- **Rate Limit:** OTP & Payment endpoints.
