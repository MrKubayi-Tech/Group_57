/**
 * DOMAIN LAYER
 * Matches the shape returned by GET /api/stats exactly (translated to camelCase).
 */
export interface DashboardStats {
  totalTickets: number;
  autoResolved: number;
  escalated: number;
  orderStatus: number;
  stockAvailability: number;
  deflectionRatePct: number; // already a whole-number percent from the API
}

export const EMPTY_STATS: DashboardStats = {
  totalTickets: 0,
  autoResolved: 0,
  escalated: 0,
  orderStatus: 0,
  stockAvailability: 0,
  deflectionRatePct: 0,
};
