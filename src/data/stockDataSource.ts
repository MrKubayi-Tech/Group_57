import type { StockItem } from "../domain";

const STOCK_URL = "/data/stock.json";

export async function fetchStockItems(): Promise<StockItem[]> {
  const res = await fetch(STOCK_URL);
  if (!res.ok) {
    throw new Error(`Failed to load stock items: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as StockItem[];
}
