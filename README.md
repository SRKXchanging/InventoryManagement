# Inventory Tracker

A clean, modern, and responsive Inventory Tracker built with **Next.js (App Router)**, **TypeScript**, and **Prisma + SQLite**.

Designed for live-demos and YouTube tutorials: clear scope, predictable outcomes, zero unnecessary abstractions, and local SQLite data persistence.

---

## Features

- **Product Management (CRUD)**:
  - Add products with Name (required), SKU (optional), and Quantity (non-negative integer).
  - Inline input validation with clear, user-friendly error messages.
  - Interactive table displaying all inventory products with real-time stock indicators:
    - 🟢 **In Stock** (5+ units)
    - 🟡 **Low Stock** (1–4 units)
    - 🔴 **Out of Stock** (0 units)
  - Quick 1-click stepper buttons (`-` / `+`) to increment/decrement quantities right from the table.
  - Edit product modal (Name, SKU, Quantity).
  - Delete product with confirmation modal dialog.
- **Search & Filtering**:
  - Live, debounced search by **Product Name** or **SKU** with an instant clear button.
- **SQLite Local Persistence**:
  - All data is persisted locally in an SQLite database via Prisma ORM. Refreshing the browser preserves all changes.
- **Metrics Dashboard**:
  - Summary cards showing Total Products, Total Units in Stock, Low Stock count, and Out of Stock alerts.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database & ORM**: SQLite + Prisma ORM
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Tailored dark mode, glassmorphism, responsive layout)

---

## Setup & Running Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Database Migrations

Generate the Prisma client and apply the SQLite migration:

```bash
npx prisma migrate dev --name init
```

*(This automatically creates `prisma/dev.db` and applies all schema migrations.)*

### 3. Seed the Database

Populate the database with 5 sample products:

```bash
npm run db:seed
```

*(Or `npx prisma db seed`)*

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the app.

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve all products (ordered by newest first) |
| `POST` | `/api/products` | Create a new product (Name, SKU, Quantity) |
| `PUT` | `/api/products/:id` | Update product fields or quantity |
| `DELETE` | `/api/products/:id` | Delete a product by its ID |
| `GET` | `/api/products/search?q=:term` | Search products matching Name or SKU |

---

## Definition of Done Verification

- [x] **Add a product**: Enter Name, SKU, and Quantity; click "Add Product".
- [x] **See it in the table**: Product immediately appears in the inventory table.
- [x] **Change its quantity**: Use the `-` / `+` quick buttons or click the Edit button to modify values.
- [x] **Delete it**: Click the Trash icon and confirm deletion in the modal dialog.
- [x] **Persistence**: Refresh the browser page and observe all data remains intact in SQLite.
