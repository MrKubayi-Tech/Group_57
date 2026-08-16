import { useEffect, useState, useCallback } from "react";
import type { Ticket } from "../../domain";
import { fetchRawTickets, fetchProcessedTickets } from "../../data";
import { buildQueueSnapshot, calculateDeflectionStats, type QueueSnapshot, type DeflectionStats } from "../../business";

/**
 * PRESENTATION LAYER (hook)
 * The only place that wires DATA (fetching) + BUSINESS (transforming)
 * together for a component to consume. Components never call fetch()
 * or the business functions directly — they call this hook.
 */

export type QueueView = "before" | "after";

interface UseTicketQueueResult {
  view: QueueView;
  setView: (v: QueueView) => void;
  snapshot: QueueSnapshot | null;
  stats: DeflectionStats | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useTicketQueue(): UseTicketQueueResult {
  const [view, setView] = useState<QueueView>("before");
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = view === "before" ? await fetchRawTickets() : await fetchProcessedTickets();
        if (!cancelled) setTickets(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load tickets");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [view, reloadKey]);

  const snapshot = tickets ? buildQueueSnapshot(tickets) : null;
  const stats = snapshot ? calculateDeflectionStats(snapshot) : null;

  return { view, setView, snapshot, stats, loading, error, reload };
}
