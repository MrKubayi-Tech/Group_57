/**
 * DOMAIN LAYER
 * Mirrors automation.py / schema.sql exactly. This is the team's shared
 * data contract — if the backend changes a field name, this is the one
 * file that must change, and data/ticketDataSource.ts is the only other
 * file that needs to know about it.
 */

/** Ticket category, decided by the classifier. Matches schema.sql's CHECK constraint. */
export type TicketTag = "order" | "stock" | "escalate";

/** What ultimately happened to the ticket. Only two real outcomes exist. */
export type TicketOutcome = "auto_resolved" | "escalated";

/** A ticket row exactly as returned by GET /api/tickets, translated to camelCase. */
export interface Ticket {
  ticketId: number;
  receivedAt: string; // ISO 8601
  rawText: string;
  tag: TicketTag;
  confidence: number; // 0.0–1.0
  orderId: string | null; // filled when tag === "order"
  productId: number | null; // filled when tag === "stock"
  resolutionText: string; // what was actually sent back to the customer
  outcome: TicketOutcome;
  processedBy: string;
}

/** The immediate response to POST /api/tickets — a single ticket, just processed. */
export interface ProcessTicketResult {
  tag: TicketTag;
  confidence: number;
  outcome: TicketOutcome;
  reply: string;
  reason: string | null; // present when outcome === "escalated"
}

/**
 * A raw customer message that hasn't been sent to the automation yet.
 * The backend has NO concept of an "unprocessed" row — every row in the
 * tickets table is already resolved. So the "before" queue is purely a
 * client-side idea: messages waiting to be POSTed.
 */
export interface IncomingTicket {
  clientId: string;
  text: string;
}
