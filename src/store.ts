// A tiny in-memory catalog + order store. No database — everything lives in process
// memory and resets on restart, which is all this sample service needs.

export interface Product {
  id: string;
  name: string;
  priceCents: number;
  /** Path under the service's own static files, e.g. GET /images/tee.png. Square, 1200 px. */
  image: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalCents: number;
  status: "created" | "confirmed" | "cancelled";
  createdAt: string;
}

export const PRODUCTS: Product[] = [
  { id: "tee", name: "Cloud Tee", priceCents: 2800, image: "/images/tee.png" },
  { id: "mug", name: "Nimbus Mug", priceCents: 1400, image: "/images/mug.png" },
  { id: "cap", name: "Field Cap", priceCents: 2400, image: "/images/cap.png" },
  { id: "tote", name: "Field Tote", priceCents: 3200, image: "/images/tote.png" },
];

const orders = new Map<string, Order>();
let seq = 1000;

export function nextOrderId(): string {
  seq += 1;
  return `ord_${seq}`;
}

export function priceOf(productId: string): number | null {
  const p = PRODUCTS.find((x) => x.id === productId);
  return p ? p.priceCents : null;
}

export function getProduct(productId: string): Product | undefined {
  return PRODUCTS.find((x) => x.id === productId);
}

export function saveOrder(order: Order): void {
  orders.set(order.id, order);
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id);
}

export function ordersForUser(userId: string): Order[] {
  return [...orders.values()].filter((o) => o.userId === userId);
}
