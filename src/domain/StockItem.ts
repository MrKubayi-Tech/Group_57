/**
 * DOMAIN LAYER
 * Represents a product's stock/availability record.
 */

export interface StockItem {
  itemId: string;
  name: string;
  inStock: boolean;
  quantityAvailable: number;
  availableSizes?: string[];
  restockDate?: string;
}
