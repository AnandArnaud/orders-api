# orders-api

A minimal orders service built with Express and TypeScript. It exposes a small REST API for
placing and confirming orders against an in-memory catalog — no database, everything resets on
restart.

**Stack:** Express 4 + TypeScript (Node)

It is realistic but intentionally small, and ships with **no product analytics wired in** — the
API route handlers just log to the console today.

## Events worth tracking

- **Order Created** — `POST /orders` (with an `x-user-id` header)
- **Order Confirmed** — `POST /orders/:id/confirm`

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
# then, in another shell:
curl -s localhost:3000/products
curl -s -X POST localhost:3000/orders -H "content-type: application/json" \
  -H "x-user-id: u_123" -d '{"items":[{"productId":"tee","quantity":2}]}'
```
