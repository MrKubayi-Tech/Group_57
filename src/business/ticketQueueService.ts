import type { Ticket } from "../domain";

/**
 * BUSINESS LAYER
 * Pure functions only — no fetch(), no React. Takes the ticket log
 * (already fetched by the data layer) and shapes it for the UI.
 *
 * Matches the real backend model: every ticket in the log has already
 * been processed into exactly one of two outcomes.
 */

export interface ProcessedQueueSnapshot {
  resolved: Ticket[];
  escalated: Ticket[];
  total: number;
}

export function buildProcessedSnapshot(tickets: Ticket[]): ProcessedQueueSnapshot {
  return {
    resolved: tickets.filter((t) => t.outcome === "auto_resolved"),
    escalated: tickets.filter((t) => t.outcome === "escalated"),
    total: tickets.length,
  };
}

/** Groups the resolved tickets by category, for a quick order-vs-stock breakdown. */
export function countByTag(tickets: Ticket[]): Record<Ticket["tag"], number> {
  return {
    order: tickets.filter((t) => t.tag === "order").length,
    stock: tickets.filter((t) => t.tag === "stock").length,
    escalate: tickets.filter((t) => t.tag === "escalate").length,
  };
}
