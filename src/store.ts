// A tiny in-memory catalog + order store. No database — everything lives in process
// memory and resets on restart, which is all this sample service needs.

export interface Product {
  id: string;
  name: string;
  priceCents: number;
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
  { id: "tee", name: "Cloud Tee", priceCents: 2800 },
  { id: "mug", name: "Nimbus Mug", priceCents: 1400 },
  { id: "cap", name: "Field Cap", priceCents: 2400 },
  { id: "tote", name: "Canvas Tote", priceCents: 3200 },
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

export function saveOrder(order: Order): void {
  orders.set(order.id, order);
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id);
}

export function ordersForUser(userId: string): Order[] {
  return [...orders.values()].filter((o) => o.userId === userId);
}
