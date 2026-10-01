import path from "node:path";
import express, { type Request, type Response, type NextFunction } from "express";
import {
  PRODUCTS,
  type Order,
  type OrderItem,
  nextOrderId,
  priceOf,
  getProduct,
  saveOrder,
  getOrder,
  ordersForUser,
} from "./store";

const app = express();
app.use(express.json());

// Product photos, served as static files (see public/images).
app.use("/images", express.static(path.join(process.cwd(), "public", "images")));

// A stand-in for real auth: the caller identifies itself with an `x-user-id` header.
// Every route below runs as that user.
function requireUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "missing x-user-id header" });
  }
  (req as Request & { userId: string }).userId = userId;
  next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/products", (_req, res) => {
  res.json({ products: PRODUCTS });
});

app.get("/products/:id", (req, res) => {
  const product = getProduct(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "product not found" });
  }
  res.json({ product });
});

// Create an order for the current user.
//
// This is the service's most important business event: a customer just placed an order.
// Right now the handler only logs it to the console.
app.post("/orders", requireUser, (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId;
  const items = (req.body?.items ?? []) as OrderItem[];

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items is required and must be non-empty" });
  }

  let totalCents = 0;
  for (const item of items) {
    const unit = priceOf(item.productId);
    if (unit === null) {
      return res.status(400).json({ error: `unknown product: ${item.productId}` });
    }
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) {
      return res.status(400).json({ error: `quantity must be positive for ${item.productId}` });
    }
    totalCents += unit * qty;
  }

  const order: Order = {
    id: nextOrderId(),
    userId,
    items,
    totalCents,
    status: "created",
    createdAt: new Date().toISOString(),
  };
  saveOrder(order);

  // No product analytics wired in yet — the handler just logs the action.
  console.log(`[orders] Order Created id=${order.id} user=${userId} total=${totalCents}`);

  res.status(201).json({ order });
});

// Confirm an order the current user owns.
app.post("/orders/:id/confirm", requireUser, (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId;
  const order = getOrder(req.params.id);
  if (!order || order.userId !== userId) {
    return res.status(404).json({ error: "order not found" });
  }
  order.status = "confirmed";
  saveOrder(order);

  // No product analytics wired in yet — the handler just logs the action.
  console.log(`[orders] Order Confirmed id=${order.id} user=${userId}`);

  res.json({ order });
});

app.get("/orders/:id", requireUser, (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId;
  const order = getOrder(req.params.id);
  if (!order || order.userId !== userId) {
    return res.status(404).json({ error: "order not found" });
  }
  res.json({ order });
});

app.get("/orders", requireUser, (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId;
  res.json({ orders: ordersForUser(userId) });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`orders-api listening on http://localhost:${port}`);
});
