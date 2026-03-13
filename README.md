# Inventory Management

Full-stack inventory management application with a REST API backend and a React dashboard frontend.

# Deployed URL 
[https://dev-comm-production.up.railway.app/](https://dev-comm-production.up.railway.app/providers)

## Tech Stack

### Backend

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [Elysia](https://elysiajs.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** PostgreSQL ([Neon](https://neon.tech/))
- **Validation:** TypeBox (via Elysia)
- **Documentation:** Swagger/OpenAPI (via `@elysiajs/swagger`)
- **Language:** TypeScript

### Frontend

- **Framework:** [React](https://react.dev/) 18 + TypeScript
- **Bundler:** [Vite](https://vite.dev/)
- **Styling:** [TailwindCSS](https://tailwindcss.com/) v4
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query) v5
- **Routing:** [React Router](https://reactrouter.com/) v7
- **Forms:** [React Hook Form](https://react-hook-form.com/)

## Prerequisites

- [Bun](https://bun.sh/) v1.0+
- [Node.js](https://nodejs.org/) v18+ (for the frontend)
- PostgreSQL database (local or hosted — [Neon](https://neon.tech/) free tier works)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/dev-commerce-api.git
cd dev-commerce-api
```

2. Install dependencies:

```bash
bun install
```

3. Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

4. Run database migrations:

```bash
bunx drizzle-kit migrate
```

5. Start the backend development server:

```bash
bun run dev
```

The API will be available at `http://localhost:3000`.

6. Install and start the frontend (in a separate terminal):

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`. It proxies API requests to the backend automatically.

## Project Structure

### Backend

```
├── src/
│   └── index.ts              # App entry point, error handling, Swagger setup
├── modules/
│   ├── products/
│   │   ├── product.routes.ts
│   │   ├── product.service.ts
│   │   ├── product.repository.ts
│   │   └── product.schema.ts
│   ├── providers/
│   │   ├── provider.routes.ts
│   │   ├── provider.service.ts
│   │   ├── provider.repository.ts
│   │   └── provider.schema.ts
│   └── categories/
│       ├── category.routes.ts
│       ├── category.service.ts
│       ├── category.repository.ts
│       └── category.schema.ts
├── db/
│   ├── index.ts              # Drizzle client
│   ├── schema.ts             # Table definitions and relations
│   └── migrations/           # SQL migration files
├── common/
│   ├── errors.ts             # Custom error classes
│   └── response-schemas.ts   # Shared TypeBox response schemas
├── drizzle.config.ts
└── package.json
```

Each module follows a layered architecture: **Routes → Service → Repository**. Routes handle HTTP concerns and validation, services contain business logic, and repositories manage database access.

### Frontend

```
frontend/
├── vite.config.ts             # Vite config with Tailwind plugin and API proxy
├── src/
│   ├── main.tsx               # React root with QueryClientProvider
│   ├── App.tsx                # Router setup with all routes
│   ├── index.css              # TailwindCSS import
│   ├── types/                 # TypeScript interfaces for API entities
│   ├── api/                   # Typed fetch wrapper and resource API functions
│   ├── hooks/                 # React Query hooks (queries + mutations)
│   ├── components/
│   │   ├── layout/            # AppLayout (sidebar + content) and Sidebar
│   │   └── ui/                # Reusable components (DataTable, Pagination, Modal, etc.)
│   └── pages/
│       ├── DashboardPage.tsx  # Summary cards with resource counts
│       ├── products/          # Product list, detail, and form pages
│       ├── providers/         # Provider list, detail, and form pages
│       └── categories/        # Category list, detail, and form pages
```

The frontend uses a typed API client layer that wraps `fetch` and maps the backend's `{ success, data, error }` envelope into typed responses. TanStack React Query manages server state with a query key factory pattern for precise cache invalidation.

## Database Design

The API uses a many-to-many relationship between products and providers through a junction table, allowing a product to have multiple providers and a provider to supply multiple products. Categories have a one-to-many relationship with products.

**Tables:**

- `products` — id, name, price, description, sku, stock_quantity, category_id, image_url, is_active, created_at, updated_at
- `providers` — id, name, address, phone, description, email, is_active, created_at, updated_at
- `categories` — id, name (unique), description, created_at, updated_at
- `product_providers` — product_id, provider_id (composite primary key, cascade delete)

Price is stored as `DECIMAL(10,2)` to avoid floating-point precision issues.

## API Documentation

Interactive Swagger documentation is available at:

```
http://localhost:3000/swagger
```

### Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint        | Description                                         |
| ------ | --------------- | --------------------------------------------------- |
| GET    | /products       | List products (paginated)                           |
| GET    | /products/:id   | Get product by ID (includes providers and category) |
| POST   | /products       | Create product                                      |
| PATCH  | /products/:id   | Update product                                      |
| DELETE | /products/:id   | Delete product                                      |
| GET    | /providers      | List providers (paginated)                          |
| GET    | /providers/:id  | Get provider by ID                                  |
| POST   | /providers      | Create provider                                     |
| PATCH  | /providers/:id  | Update provider                                     |
| DELETE | /providers/:id  | Delete provider                                     |
| GET    | /categories     | List categories (paginated)                         |
| GET    | /categories/:id | Get category by ID                                  |
| POST   | /categories     | Create category                                     |
| PATCH  | /categories/:id | Update category                                     |
| DELETE | /categories/:id | Delete category                                     |

### Advanced Query Features

All list endpoints support the following query parameters:

**Pagination:**

```
GET /products?page=2&limit=20
```

**Field Selection:**

```
GET /products?fields=id,name,price
```

**Sorting** (prefix with `-` for descending, comma-separated for multiple):

```
GET /products?sort=name,-price
```

**Filtering:**

```
GET /products?name=laptop                    # exact match
GET /products?name[like]=lap                 # partial match
GET /products?price[gte]=100&price[lte]=500  # range
GET /products?isActive=true                  # boolean
```

### Response Format

**Success (single resource):**

```json
{
  "success": true,
  "data": { "id": "...", "name": "...", ... }
}
```

**Success (list):**

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "offset": 0,
    "totalItems": 50,
    "totalPages": 5
  }
}
```

**Error:**

```json
{
	"success": false,
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Request validation failed",
		"details": [{ "field": "price", "message": "Expected number" }]
	}
}
```

### Status Codes

| Code | Usage                       |
| ---- | --------------------------- |
| 200  | Successful GET, PATCH       |
| 201  | Successful POST             |
| 204  | Successful DELETE           |
| 400  | Bad request / invalid input |
| 404  | Resource not found          |
| 422  | Validation error            |
| 500  | Internal server error       |

## Testing

A Postman collection is included in the repository for manual API testing:

1. Import `InventoryManagementAPI_postman_collection.json` into Postman
2. Set the `base_url` collection variable to `http://localhost:3000/api/v1`
3. Run requests against each endpoint

The collection includes example request bodies and query parameters for all CRUD operations and advanced features.

## Environment Variables

| Variable     | Description                  | Required |
| ------------ | ---------------------------- | -------- |
| DATABASE_URL | PostgreSQL connection string | Yes      |

## Frontend

The React frontend provides a complete dashboard for managing inventory data.

### Pages

| Route                  | Page                | Description                                     |
| ---------------------- | ------------------- | ----------------------------------------------- |
| `/`                    | Dashboard           | Summary cards with total counts per resource    |
| `/products`            | Product List        | Searchable, filterable table with pagination    |
| `/products/new`        | Create Product      | Form with category dropdown and provider select |
| `/products/:id`        | Product Detail      | Full product view with linked providers         |
| `/products/:id/edit`   | Edit Product        | Pre-populated edit form                         |
| `/providers`           | Provider List       | Searchable table with pagination                |
| `/providers/new`       | Create Provider     | Provider creation form                          |
| `/providers/:id`       | Provider Detail     | Full provider view                              |
| `/providers/:id/edit`  | Edit Provider       | Pre-populated edit form                         |
| `/categories`          | Category List       | Searchable table with pagination                |
| `/categories/new`      | Create Category     | Category creation form                          |
| `/categories/:id`      | Category Detail     | Full category view                              |
| `/categories/:id/edit` | Edit Category       | Pre-populated edit form                         |

### Features

- **Search and filtering** — Debounced search by name, price range filters for products
- **Pagination** — Server-side pagination with page navigation controls
- **CRUD operations** — Create, view, edit, and delete for all resources with confirmation dialogs
- **Form validation** — Client-side validation via React Hook Form with server-side API error mapping to individual fields
- **Responsive layout** — Collapsible sidebar navigation for mobile screens
- **URL state** — Filters and pagination are stored in URL search params for bookmarkability and back/forward navigation

### Building for Production

```bash
cd frontend
npm run build
```

Static files are output to `frontend/dist/` and can be served by any static file server or reverse proxy.

## Known Limitations

- No authentication or authorization
- No rate limiting
- Price filtering uses string comparison at the database level (Drizzle decimal type)
- No database seeding script included — data must be created via the API
