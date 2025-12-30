# Unicase 🛍️

**Unicase** is a generic e-commerce platform designed for the Iranian market, featuring a **Server-Centric** architecture using Next.js 15 (App Router).

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database:** PostgreSQL (Managed by Prisma ORM)
- **Styling:** Tailwind CSS + Shadcn UI
- **Auth:** Auth.js (v5)
- **Validation:** Zod
- **Payment:** Zarinpal Integration
- **State Management:** React Server Components (Server) + Zustand (Client)

## 📂 Project Structure

The project follows a **Domain-Driven Design (DDD)** approach tailored for Next.js App Router (Vertical Slicing):

- **`src/app`**: Application routes (Public Storefront, Auth, Admin Dashboard).
- **`src/actions`**: Server Actions for database mutations (RPC-style, No API routes).
- **`src/components`**:
  - `ui/`: **Atomic Primitives** (Shadcn UI base components).
  - `admin/`, `cart/`, `product/`: **Domain Modules** (Encapsulated feature logic).
- **`src/lib`**: Shared Kernel & Core utilities (DB Singleton, S3 Handler, Zarinpal).
- **`docs/`**: Project Knowledge Base (The "Brain").

## 🛠️ Getting Started

### 1. Prerequisites

- **Node.js:** v18.17 or higher
- **Docker:** Required for running the local PostgreSQL database.

### 2. Installation

```bash
# Clone the repository
git clone [https://github.com/your-username/unicase.git](https://github.com/your-username/unicase.git)
cd unicase

# Install dependencies
npm install

# Setup Environment Variables
# Duplicate the example env file and fill in your secrets
cp .env.example .env
```

````

### 3. Database Setup

We use Docker to run a local instance of PostgreSQL.

```bash
# 1. Start the Postgres container
docker-compose up -d

# 2. Run migrations to create tables
npx prisma migrate dev

# 3. Seed the database with initial data (Categories, Admin User)
npx prisma db seed

```

### 4. Run Development Server

```bash
npm run dev

```

- Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to view the **Storefront**.
- Access [http://localhost:3000/admin](https://www.google.com/search?q=http://localhost:3000/admin) for the **Back-Office**.

## 🤝 Contribution Rules

Before writing any code, please read the documentation in the `docs/` folder to understand the "Unicase Way":

1. **Architecture:** [docs/architecture.md](https://www.google.com/search?q=./docs/architecture.md) - System design & directory structure.
2. **Coding Rules:** [docs/rules.md](https://www.google.com/search?q=./docs/rules.md) - Standards for AI & Human collaboration.
3. **Design System:** [docs/design-guidelines.md](https://www.google.com/search?q=./docs/design-guidelines.md) - UI/UX & Apple-style aesthetic.

## 📝 Change Log

See [changes-log.log](https://www.google.com/search?q=./changes-log.log) for a list of notable changes and updates.

---

_Built with ❤️ by the Unicase Engineering Team_

```

```
````
