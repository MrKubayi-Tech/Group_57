import { useCallback, useEffect, useState } from "react";
import type { Ticket, DashboardStats, IncomingTicket } from "../../domain";
import { EMPTY_STATS } from "../../domain";
import { fetchTicketLog, fetchStats, submitTicket, getSampleIncomingQueue, ApiError } from "../../data";
import { buildProcessedSnapshot, type ProcessedQueueSnapshot } from "../../business";

/**
 * PRESENTATION LAYER (hook)
 * The only place that wires DATA (HTTP calls) + BUSINESS (grouping)
 * together for components. Components never call fetch() or the
 * business functions directly.
 */

interface UseTicketAutomationResult {
  incoming: IncomingTicket[];
  log: Ticket[] | null;
  snapshot: ProcessedQueueSnapshot | null;
  stats: DashboardStats;
  loadingLog: boolean;
  running: boolean;
  error: string | null;
  runAutomation: () => Promise<void>;
  refreshLog: () => Promise<void>;
}

export function useTicketAutomation(): UseTicketAutomationResult {
  const [incoming, setIncoming] = useState<IncomingTicket[]>(() => getSampleIncomingQueue());
  const [log, setLog] = useState<Ticket[] | null>(null);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loadingLog, setLoadingLog] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLog = useCallback(async () => {
    setLoadingLog(true);
    try {
      const [ticketLog, dashboardStats] = await Promise.all([fetchTicketLog(), fetchStats()]);
      setLog(ticketLog);
      setStats(dashboardStats);
      setError(null);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoadingLog(false);
    }
  }, []);

  useEffect(() => {
    refreshLog();
  }, [refreshLog]);

  const runAutomation = useCallback(async () => {
    if (incoming.length === 0) return;
    setRunning(true);
    setError(null);
    try {
      // Submit sequentially so the ticket_id order in the log matches
      // the order they appear in the "before" queue — easier to narrate live.
      for (const ticket of incoming) {
        await submitTicket(ticket.text);
      }
      setIncoming([]);
      await refreshLog();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setRunning(false);
    }
  }, [incoming, refreshLog]);

  const snapshot = log ? buildProcessedSnapshot(log) : null;

  return { incoming, log, snapshot, stats, loadingLog, running, error, runAutomation, refreshLog };
}

function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.status === 0
      ? "Can't reach the API — is `python api.py` running on port 5000?"
      : err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong talking to the API.";
}
