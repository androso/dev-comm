# Inventory Management API

REST API for managing products, providers, and categories.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [Elysia](https://elysiajs.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** PostgreSQL ([Neon](https://neon.tech/))
- **Validation:** TypeBox (via Elysia)
- **Documentation:** Swagger/OpenAPI (via `@elysiajs/swagger`)
- **Language:** TypeScript

## Prerequisites

- [Bun](https://bun.sh/) v1.0+
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

5. Start the development server:

```bash
bun run dev
```

The API will be available at `http://localhost:3000`.

## Project Structure

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

## Known Limitations

- No authentication or authorization
- No rate limiting
- Price filtering uses string comparison at the database level (Drizzle decimal type)
- No database seeding script included — data must be created via the API
