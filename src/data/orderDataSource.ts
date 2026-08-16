import type { Order } from "../domain";

const ORDERS_URL = "/data/orders.json";

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(ORDERS_URL);
  if (!res.ok) {
    throw new Error(`Failed to load orders: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as Order[];
}
