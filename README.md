# StockPulse (CE-1)

Wholesale commerce and rule-based smart inventory. React + Vite + Tailwind, Express, MongoDB/Mongoose, JWT.

## Run it
Requires Node 18+ and MongoDB (local, or an Atlas URI).
```bash
npm run install:all
cp backend/.env.example backend/.env      # set JWT_SECRET and MONGODB_URI
cp frontend/.env.example frontend/.env
npm run seed                              # 24 products, 2 demo users, 5 orders
npm run dev                               # API :5000, web :5173
```
Run separately with `npm run dev --prefix backend` and `npm run dev --prefix frontend`.

## Demo accounts (created only by `npm run seed`, passwords come from backend/.env)
| Role | Email | Default password |
|---|---|---|
| Admin | admin@stockpulse.dev | Admin@12345 |
| Retailer | retailer@stockpulse.dev | Retail@12345 |

Public registration always creates retailers; the role field is ignored. Admins exist only via the seed script.

## Tests
`npm test` runs API security tests (auth, role checks, validation, 404). They need no database.

## API quick reference
```bash
curl -X POST localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"retailer@stockpulse.dev","password":"Retail@12345"}'
curl 'localhost:5000/api/products?q=tea&category=Pantry&sort=price_asc&page=1'
curl -X POST localhost:5000/api/orders -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"clientRequestId":"abc-1","delivery":{"contactName":"A","phone":"9876543210","address":"14 Mall Rd","city":"Rajpura","postalCode":"140401"},"items":[{"productId":"<id>","quantity":12}]}'
curl localhost:5000/api/inventory/summary -H "Authorization: Bearer $ADMIN_TOKEN"
```
Endpoints: `/auth/{register,login,me}`, `/products` (GET public; POST/PUT/DELETE admin; `/categories`), `/inventory/{summary,low-stock,products}` and `PATCH /inventory/:id/stock` (admin), `/orders` (POST retailer; `/mine`; GET all admin; `/:id`; `PATCH /:id/status` admin).

## Design decisions
- **Inventory** lives only on `Product.stockQuantity`; no separate Inventory collection.
- **Stock rules**: 0 = out of stock; at or below `lowStockThreshold` = low; suggested reorder = `targetStockLevel - stockQuantity`. Fully rule-based, no ML.
- **Order integrity**: prices and totals are computed on the server. Stock is deducted with a conditional atomic `$inc` (`stock >= qty`), so it cannot go negative. If any line fails, earlier deductions are reversed. Multi-document transactions need a replica set, so this compensation approach is used instead. A crash between steps could still leave stock reserved without an order.
- **Duplicates**: checkout sends a `clientRequestId`; a unique partial index returns the original order on retry.
- **Cancelling** an order returns its stock. Deleting a product only deactivates it.
- **Tokens** are kept in localStorage (simple for CE-1; httpOnly cookies are a CE-2 hardening step). Roles are read from the JWT, so a role change applies at next login.

## Completed
Landing, catalogue (search/filter/sort/pagination), product detail with bulk tiers, persistent cart, checkout, confirmation, registration/login/logout, role-protected routes and APIs, admin overview, product CRUD and stock edits, order management with status updates.

## Known limitations
- Product photos come from loremflickr keyword searches, so they are topical but not exact, and need internet. A package icon shows if one fails.
- Automated tests cover security rules only; order/stock flows were not run against a live database in this build. Verify with the manual flow below.
- No payments, uploads, suppliers, warehouses or replenishment workflow (future phases). Prices display in USD.

## Manual end-to-end check
Register a retailer, add 24 Arabica Beans, check out, note stock drop on the product page; log in as admin, see the order, mark it cancelled and confirm stock returns; edit a product and watch the low-stock list on Overview.
