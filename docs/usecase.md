# System Use Cases

## 0. System Scope & Principles

- **Architecture:** Modular Monolith (Designed for future Microservices split).
- **Consistency Model:** Strong Consistency for Financial & Inventory transactions.
- **Source of Truth:** Server-side validation is the ONLY authority. Client state is untrusted.
- **Scalability:** Event-Driven architecture for Notifications, Logging, and Async Tasks.

## 1. User Identity & Access Control

### 1.1. Authentication

- **Entry Point:** Single input for Phone Number.
- **Logic Flow:**
  - **If User Exists:** Request **Password** immediately to login.
  - **If New User:**
    1. Request user to **Define Password**.
    2. Send **OTP** to verify phone number.
    3. Verify OTP + Save Password -> Register User.
- **Security Controls:**
  - **Rate Limiting:** Max 5 OTP requests per hour.
  - **Session:** JWT (Short-lived 15m) + Refresh Token (HttpOnly Cookie, 7d).

### 1.2. Roles & Permissions

- **USER:** Browse, Cart, Checkout, Profile Management, Write Reviews.
- **SUPPORT:** Manage Returns (RMA), Reply to Q&A, View Order Status.
- **ADMIN:** Full System Access (Settings, Users, Financials).

### 1.3. User Lifecycle States

- **ACTIVE:** Standard access.
- **SUSPENDED:** Temporary restriction (e.g., suspicious activity).
- **BANNED:** Permanent block (Fraud prevention).

## 2. Product Catalog & Pricing Engine

### 2.1. Product Data Model

- **Product:** The base entity.
- **Variant:** Specific SKUs (Color, Size, Storage, Wattage).
- **Category:** Tree-based hierarchy (e.g., Electronics > Phones > Apple).
- **Attributes:** Dynamic JSON schema based on Category.

### 2.2. Currency-Aware Pricing

- **Base Price:** Stored in a stable unit (Toman) in the database.
- **Global Multiplier:** `CurrencyMultiplier` (Admin Config).
- **Display Price:** `BasePrice` \* `CurrencyMultiplier`.
- **Price Snapshot:**
  - When an Order is created, the _current_ calculated price is saved into `OrderItem`. Future currency fluctuations MUST NOT affect past orders.
- **Volatility Protection:**
  - If `CurrentPrice` > `CartItemPrice` at the moment of checkout -> **BLOCK** payment and alert user.

## 3. Search, Filter & Compatibility

### 3.1. Contextual Discovery

- **Dynamic Filters:** Filter keys adapt to the current Category context.
- **Device Compatibility:**
  - User selects "Target Device" (e.g., "iPhone 13").
  - Catalog hides incompatible accessories automatically.

## 4. Cart & Checkout

### 4.1. Cart Logic

- **Guest Experience:** Cart stored in HTTP-only Cookie.
- **Auth Merging:** On Login, Guest Cart items merge into the User's persistent DB Cart.
- **Validation:** Server re-checks Price and Stock availability on every page load.

### 4.2. Inventory Locking (Concurrency Control)

- **Strategy:** "First-Pay-First-Serve".
- **Lock Timing:**
  - Adding to cart does **NOT** reserve stock.
  - Inventory is locked exclusively when `INITIATE_PAYMENT` is called.
- **TTL (Time-To-Live):** The lock expires automatically after **10 minutes** if payment is not completed.
- **Atomic Operation:** Deduction happens via database transactions (Prisma Interactive Transaction).

## 5. Order Lifecycle Management

### 5.1. Order Status Machine

1.  **CREATED:** Order draft exists.
2.  **PENDING_PAYMENT:** User redirected to Gateway.
3.  **PAID:** Gateway callback verified successful.
4.  **PROCESSING:** Warehouse is packing the items.
5.  **SHIPPED:** Tracking code assigned.
6.  **DELIVERED:** Courier confirmed delivery.
7.  **CANCELED:** System or User cancelled (Before shipping).
8.  **REFUNDED:** Admin processed return.

### 5.2. Cancellation Rules

- **Auto-Cancel:** If `PENDING_PAYMENT` exceeds 1 hour.
- **User-Cancel:** Allowed only if status is `PAID` or `PROCESSING`. Once `SHIPPED`, RMA flow is required.

## 6. Financial & Payment Abstraction

### 6.1. Payment Gateway Strategy (Provider Agnostic)

- **Architecture:** The system uses a "Payment Adapter" pattern.
- **Supported Providers:** Zarinpal , Zibal , Mellat (Future).
- **Idempotency:** Unique `OrderId` generation prevents double-spending.
- **Flow:**
  - Request Payment Token -> Redirect User -> Verify Callback -> Record Transaction.

### 6.2. Refunds & Reversals

- **Policy:** Manual Processing only.
- **Workflow:** Admin approves Refund -> Admin transfers funds manually -> Admin updates status to `REFUNDED`.
- **Audit:** Mandatory log for who processed the refund and why.

## 7. Logistics & Shipping

### 7.1. Cost Calculation

- **Rules:**
  - If `Total` > `FreeShippingThreshold`: Free.
  - Else: `BaseFee` + (`TotalWeight` \* `DistanceRate`).
- **Zone Validation:** Address Postal Code is checked against serviceable zones.

## 8. Marketing & Growth

### 8.1. Coupon Engine

- **Types:** Fixed Amount / Percentage.
- **Constraints:** Minimum Order Value, Specific Category, Max Usage Per User.
- **Anti-Abuse:** Backend validation to prevent coupon stacking (unless allowed).

### 8.2. Referral Program

- **Mechanism:** User A invites User B.
- **Reward:** User A gets credit ONLY after User B completes their first `PAID` order.

## 9. Social Proof & Engagement

### 9.1. Reviews

- **Verified Badge:** Only users with a `DELIVERED` order for that specific ItemID can leave a "Verified Review".
- **Moderation:** Reviews are `HIDDEN` by default until Admin approves (Spam protection).

### 9.2. Q&A

- Public questions on product pages. Admins or previous buyers can answer.

## 10. Post-Purchase Support (RMA)

### 10.1. Return Workflow

- **Evidence First:** User must upload Media (Image/Video) to request a return.
- **Admin Decision:** Approve (Send Return Label) or Reject (Invalid reason).

### 10.2. Notifications

- **Channels:** SMS (Critical updates/Invoices/Marketing).
- **Triggers:** Order Placed, Payment Success, Shipped (w/ Tracking ID).

## 11. Admin Operations & Analytics

### 11.1. Operational Controls

- **Macro Economy:** Single input to update `CurrencyMultiplier`.
- **Inventory Health:** Dashboard alerts for "Low Stock" items.

### 11.2. Business Intelligence (BI)

- **Reports:** Sales Volume, Revenue, Best Selling Categories.
- **Funnel Analysis:** Cart Abandonment Rate.

## 12. Security & Compliance

- **Data Safety:** Rate Limiting on all public POST endpoints.
- **CSRF Protection:** Native Next.js protection.
- **Audit Logging:** Record all high-risk Admin actions (Price changes, Refunds, Bans).
