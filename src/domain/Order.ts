/**
 * DOMAIN LAYER
 * Represents a customer order as the automation and UI both understand it.
 */

export type OrderStatus = "processing" | "shipped" | "out_for_delivery" | "delivered";

export interface Order {
  orderId: string;
  customerEmail: string;
  item: string;
  status: OrderStatus;
  carrier?: string;
  trackingUrl?: string;
  shippedDate?: string;
  estimatedDelivery?: string;
}
