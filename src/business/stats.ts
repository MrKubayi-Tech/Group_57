import type { QueueSnapshot } from "./ticketQueueService";

/**
 * BUSINESS LAYER
 * Turns a queue snapshot into the headline numbers the demo leads with:
 * "X% of tickets never reached a human agent."
 */

export interface DeflectionStats {
  totalTickets: number;
  autoResolvedCount: number;
  autoTaggedCount: number;
  stillManualCount: number;
  deflectionRatePct: number; // resolved / total, rounded to whole percent
}

export function calculateDeflectionStats(snapshot: QueueSnapshot): DeflectionStats {
  const { total, resolved, tagged, unresolved } = snapshot;

  const deflectionRatePct = total === 0 ? 0 : Math.round((resolved.length / total) * 100);

  return {
    totalTickets: total,
    autoResolvedCount: resolved.length,
    autoTaggedCount: tagged.length,
    stillManualCount: unresolved.length,
    deflectionRatePct,
  };
}
