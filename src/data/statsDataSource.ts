import type { DashboardStats } from "../domain";
import { apiFetch } from "./apiClient";

// Shape exactly as api.py's stats() returns it.
interface StatsApiResponse {
  total_tickets: number;
  auto_resolved: number;
  escalated: number;
  order_status: number;
  stock_availability: number;
  deflection_rate: number;
}

/** GET /api/stats — live-queried totals for the dashboard headline numbers. */
export async function fetchStats(): Promise<DashboardStats> {
  const d = await apiFetch<StatsApiResponse>("/api/stats");
  return {
    totalTickets: d.total_tickets,
    autoResolved: d.auto_resolved,
    escalated: d.escalated,
    orderStatus: d.order_status,
    stockAvailability: d.stock_availability,
    deflectionRatePct: d.deflection_rate,
  };
}
