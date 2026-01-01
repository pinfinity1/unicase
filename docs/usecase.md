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

### 2.2. Dynamic Pricing Logic (Currency Aware)

- **Problem:** Due to daily currency fluctuations, manual price updates are inefficient.
- **Solution:**
  - **Base Price:** Products store a `BasePrice` (e.g., in USD or Fixed Unit).
  - **Global Multiplier:** Admin sets a `CurrencyRate` (e.g., 60,000 Tomans) in `SiteSettings`.
  - **Calculation:** `DisplayPrice = BasePrice * CurrencyRate`.
- **Smart Rounding:** Calculated prices should automatically round to meaningful numbers (e.g., round 1,234,500 to 1,235,000).
- **Snapshot Rule:** When an **Order** is placed, the _calculated price_ at that exact moment must be saved into `OrderItem`. Future currency changes MUST NOT change the price of past orders.

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

### 11.1. Operational Dashboard & Macro Controls

- **Macro Economy (Currency Engine):**
  - **Global Multiplier:** A single input field to update the `CurrencyRate` (e.g., set Dollar rate to 60,000 Toman).
  - **Real-time Reflection:** All product prices on the storefront (`BasePrice * CurrencyRate`) must update immediately upon saving.
- **Inventory Health (Low Stock Alert):**
  - **Dashboard Widget:** Displays a list of products/variants where `Stock < Threshold` (default 5).
  - **Action:** Quick link to "Restock" directly from the dashboard.

### 11.2. Advanced Catalog Management

- **Product Lifecycle:**
  - **Drafting:** Create products in `DRAFT` mode (hidden) before publishing.
  - **Versioning:** (Optional) Keep history of price/stock changes for 30 days.
  - **Bulk Actions:** Select multiple products to: Change Status (Archive/Active), Update Stock, or Move Category.
- **Variant Logic:**
  - Independent SKU management for each Variant (Color/Size).
  - **Price Override:** Ability to set specific price additions for variants (e.g., Gold color is +500,000 Toman \* CurrencyRate).
- **Dynamic Attributes:**
  - Define custom specs based on Category (e.g., "Screen Size" for Phones, "Fabric" for Clothes).

### 11.3. Order Fulfillment & Logistics

- **Order Workflow:**
  - **Verification:** Manually verify high-value orders (> 100M Toman) before Processing.
  - **Shipping:** Batch print shipping labels/invoices.
  - **Manual Override:** Admin can cancel an order manually and trigger a refund process.
- **RMA (Return Merchandise Authorization):**
  - **Review Request:** View user uploaded images for return requests.
  - **Decision:** Approve (Issue Return Label) or Reject (with reason).
  - **Restocking:** Upon receiving returned item, decide to: "Add back to Stock" or "Mark as Damaged".

### 11.4. Marketing & Growth Engine

- **Coupon System:**
  - **Types:** Percentage (e.g., 10%) or Fixed Amount (e.g., 50k Toman).
  - **Conditions:** Min Order Value, Specific Category Only, Max Usage Total, Max Usage Per User.
  - **Expiry:** Auto-disable coupon after `EndDate`.
- **Campaign Management:**
  - **Hero Banner:** Upload and schedule Main Slider images.
  - **Flash Sales:** Set timer-based discounts for "Amazing Offers" (Pishnahad Shegeft-Angiz).

### 11.5. Financial & Users

- **User Management:**
  - **Audit Logs:** View activity log of a user (Last login IP, Failed payment attempts).
  - **Role Management:** Granular permissions (e.g., "Content Editor" can only change products, not view sales).
- **Financial Reconciliation:**
  - **Gateway Check:** List successful payments that don't have a matching Order (Zombie Transactions).
  - **Daily Report:** Total Revenue, Cancelled Orders Value, Net Profit.

## 12. Security & Compliance

- **Data Safety:** Rate Limiting on all public POST endpoints.
- **CSRF Protection:** Native Next.js protection.
- **Audit Logging:** Record all high-risk Admin actions (Price changes, Refunds, Bans).

## 13. User Dashboard & Profile (Enterprise Level)

### 13.1. Dashboard & Identity

- **Profile Completion:** Progress bar for "Verify Email", "Add Address", "Set Birthday".
- **Security Center:**
  - **Change Password:** Requires `CurrentPassword` validation.
  - **Active Sessions:** View and revoke other logged-in devices (Sessions).

### 13.2. Order Management (User Side)

- **Detailed Tracking:** Visual timeline: `Paid` -> `Processing` -> `Shipped` -> `Delivered`.
- **Actionable Items:**
  - **Cancel Order:** Only available if status is `PENDING` or `PAID` (Not `PROCESSING`).
  - **Re-Payment:** If a payment failed, retry specifically for that OrderID without rebuilding the cart.
- **Invoice:** Download official PDF invoice (Factor).

### 13.3. Returns (RMA) Flow

- **Initiate Return:**
  - Select specific item from a `DELIVERED` order.
  - Select Reason (Defective, Wrong Item, Changed Mind).
  - **Evidence:** Mandatory photo upload for "Defective" claims.
  - **Status:** Track return status (Pending Review -> Courier on way -> Refunded).

### 13.4. Wallet & Credits (Optional Phase)

- **Balance View:** View current store credit (Toman).
- **History:** List of "Deposit" (Refunds/Gift Cards) and "Withdrawal" (Purchases).

### 13.5. Address Book Logic

- **Geo-Location:** Select location on map (Leaflet/Google Maps) to auto-fill City/Province.
- **Validation:** Postal code validation (10 digits) before saving.

### 13.6. Engagement

- **Notifications:** In-app inbox for "Order Shipped", "Price Drop Alert", or "Welcome Coupon".
- **Comments:** View status of submitted comments (Pending/Published/Rejected).
