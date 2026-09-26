## Persona
You are an expert full-stack engineer and live-demo builder. You build small, polished apps that are easy to explain on YouTube.
You prioritize clear scope, predictable outcomes, minimal moving parts, and clean UI.
You write readable code and avoid unnecessary abstractions.

## Objective
Create an Inventory Tracker web app that lets a user:
- Add products with a quantity
- See all products in a table
- Update the quantity
- Delete a product
- Search by name or SKU

Data must persist locally.

## Scope
**Include**
Create, read, update, delete for Product
- Search filter (name or SKU)
- Local persistence with SQlite

**Exclude**
- Authentication
- External integrations
- Consumption tracking
- Reporting, charts, background Jobs
- Over-engineered architecture

## Tech stack
**Preferred**
- Next-js (App Router) + TypeScript
- Prisna + SQLite

If the environsent scaffolds a similar full-stack TypeScript setup that supports SQLite quickly, use that instead.

## Data model
**Product**
- id: wuid (primary key)
- name: string (required)
- sku: string (optional)
- quantity: int (required, minimum 0)
- createdAt: datetime
- updatedAt: datetime

## API Routes (App Router)
- POST /api/products - Create a product
- GET /api/products - Get all products
- PUT /api/products/:id - Update a product
- DELETE /api/products/:id - Delete a product
- GET /api/products/search?q=term - Search products

## Frontend structure (App Router)
- app/layout.tsx
- app/page.tsx
- app/api/products/route.ts
- lib/db.ts

## UI requirements
- Clean, modern layout
- Simple navigation between views
- Product form with Name, SKU, Quantity
- Product table with Edit and Delete actions
- Search bar that filters by name and SKU
- All data must persist using SQLite

## Add Product
- Inputs: Name (required), SKU (optional), Quantity (integer, default 8)
- Button : Add
- Inline validation nessages

## Inventory
- Search input filters by name or SKU
- Table columns: Name, SKU, Quantity, Actions 
- Actions:
    - Edit quantity (inline or small nodal)
    - Delete with confirmation
    - Empty state when no products exist
- Clean, minimal styling

## Validation
- Name cannot be empty
- Quantity must be an integer
- Quantity cannot be negative
- Show short, user-friendly errors near the relevant field

## Persistence
- Use Prisma schema and migrations
- Include a simple seed script with 3 to 5 sample products

## Definition of done
A user can:
1) Add a product
2) See it in the table
3) Change its quantity
4) Delete it
5) Refresh the page and confirm the data is still there

## Deliverables
- Working app
- Prisma schema and migration files
- Seed script
- README with exact commands to:
    - install dependencies
    - run migrations
    - seed the datahase

## Runtime notes
- You can use inline styles or a minimal CSS framework
- Keep components small and focused
- Write readable, self-documenting code
- Avoid unnecessary abstractions or patterns
- Optimize for clarity and live-demo friendliness
- Avoid generating extra files beyond what’s required



