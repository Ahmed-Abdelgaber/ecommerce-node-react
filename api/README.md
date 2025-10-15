# E-commerce API

TypeScript Express backend that powers the ecommerce platform. It exposes authentication, catalog, cart, order, and profile workflows behind a Prisma/PostgreSQL datastore.

## Tech Stack
- Node.js + TypeScript
- Express with Zod validation and custom error handling
- Prisma ORM
- Vitest + Supertest-style controller harnesses (unit tests)

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create an `.env` file in `api/` with at least the required variables:

```
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
JWT_SECRET="replace-with-32-char-secret"
CORS_ORIGIN="http://localhost:5173"
COOKIE_DOMAIN="localhost"
```

> See `src/core/config/env.ts` for the full list and defaults.

### 3. Set up the database
Generate Prisma client and apply migrations:
```bash
npx prisma generate
npx prisma migrate deploy   # or migrate dev for local iteration
```

Optional: seed sample catalog data.
```bash
npx tsx src/db/seed.ts
```

### 4. Run the server
```bash
npm run dev
```
The API listens on `http://localhost:4000` by default.

### 5. Execute tests
```bash
npm test
```

## Project Structure
```
src/
  app/         Express app wiring (routes, middleware, server)
  core/        Configuration, security, error helpers
  db/          Prisma client and seed scripts
  modules/     Feature modules (auth, product, cart, order, profile)
tests/         Vitest controller unit tests + utilities
```

## API Documentation
- OpenAPI spec: [`openapi.yaml`](./openapi.yaml) describing request/response contracts that the frontend can consume.

Key route groups:

| Path prefix          | Description                     |
|----------------------|---------------------------------|
| `POST /api/v1/auth`  | Registration, sign-in, token ops |
| `GET /api/v1/products` | Catalog browsing and filters   |
| `POST /api/v1/cart`  | Cart management (requires auth) |
| `POST /api/v1/orders`| Checkout and order history      |
| `GET /api/v1/profile`| Profile/accounts + addresses    |

Refer to the OpenAPI spec for payload schemas.

## Logging & Error Handling
- Requests are logged via Pino with request duration.
- Errors propagate through a centralized handler that returns JSON error envelopes `{ error: { message, status } }`.

## Conventions
- All controllers are thin, delegating domain logic to module services.
- Validation happens with Zod schemas per route/controller pair.
- Use `npm test` before submitting changes to ensure coverage stays green.

