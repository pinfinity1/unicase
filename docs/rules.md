# Rules for AI Collaboration & Unicase Engineering

## 1. Purpose

This repository follows the **Unicase Architecture** (Next.js 15 + Prisma + Shadcn).
This file acts as the shared source of truth for Human + AI collaboration. All generated code must adhere strictly to these rules to maintain "Senior-Level" quality.

## 2. Required Context Files

Before writing a single line of code, the AI **MUST read and understand** the following documents:

1.  `docs/architecture.md`: High-level system design and directory structure.
2.  `docs/usecases.md`: The core business logic and user stories.
3.  `docs/rules.md`: This file (Collaboration & Technical Standards).
4.  `docs/design-guidelines.md`: UI/UX, RTL, and Tailwind conventions.

## 3. Core Principles

- **Spec-First Development:** No coding happens without a defined objective in `usecases.md` or a generated PRD.
- **Single Responsibility:** Code must implement ONLY what is defined in the request. No "Extra" features without approval.
- **Source of Truth:** The Database Schema (`schema.prisma`) is the ultimate truth. Do not duplicate business logic on the client side.

## 4. Development Workflow

1.  **Describe Feature:** Human describes the need (e.g., "Add Admin Dashboard").
2.  **Context Check:** AI reads existing docs to ensure consistency.
3.  **Draft Implementation:** AI proposes the file structure or logic strategy.
4.  **Implementation:** AI generates code respecting the **Technical Constraints** (Section 9 below).
5.  **Documentation:** AI updates `changes-log.log` or `usecases.md` to reflect completed tasks.

## 5. Behavioral Rules for AI Agents

- **Context Awareness:** Always check if a generic component (e.g., `Button`, `Card`) already exists in `src/components/ui` before creating a new one.
- **No Hallucinations:** Do NOT import libraries that are not in `package.json`. Ask for permission to install new ones.
- **Safety First:** If a request conflicts with `rules.md` (e.g., "Write inline CSS"), the AI must refuse and explain why.
- **Modular Code:** Produce concise, readable, and modular code. Functions > 50 lines should be refactored.

## 6. Commit & Interaction Policy

- When providing code, always specify the full file path (e.g., `src/components/cart/cart-item.tsx`).
- If editing an existing file, provide the **Full File Content** (or clear search/replace blocks) to avoid merge errors.

## 7. Communication & Conflict Resolution

- If instructions are unclear, the AI must **PAUSE** and ask for clarification.
- If the human suggests a "Bad Practice" (e.g., leaking secrets), the AI must warn them.

## 8. Auto-Documentation Rule (Crucial)

- Every time a new feature is added, the AI is responsible for checking if `architecture.md` needs updating (e.g., a new folder was added).
- Keep `README.md` clean and updated with setup instructions.

## 9. Technical Constraints (The "Lich" Standards)

### Tech Stack

- **Framework:** Next.js 15+ (App Router).
- **Language:** TypeScript (Strict Mode). No `any` type allowed.
- **ORM:** Prisma.
- **Styling:** Tailwind CSS + Shadcn UI (No Raw CSS).
  - **Forbidden:** RAW CSS files, SCSS, Styled Components, or inline `style={{...}}`.
- **State Management:**
  - **Server State:** React Server Components (fetching) + Server Actions (mutations).
  - **Client Global State:** Zustand (`src/store`) - Use sparingly.
- **Auth:** Auth.js (NextAuth v5 beta strategy).
- **Validation:** Zod is mandatory for ALL inputs (Server Actions & Forms).

### Coding Patterns

- **Server Components Default:** Use `'use client'` only when necessary (hooks/state).
- **RTL Support:** Always use logical properties (`ms-`, `me-`) or ensure layout works in `dir="rtl"`.
- **Type Safety:** TypeScript Strict Mode. No `any`. Use `interface` for props.

### Error Handling & Security Standard

- **Server Actions Response:** MUST return a standardized object:
  ```ts
  type ActionResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string };
  ```
