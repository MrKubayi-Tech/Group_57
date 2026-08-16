import type { Ticket, ProcessTicketResult } from "../domain";
import { apiFetch } from "./apiClient";

/**
 * DATA LAYER
 * The only place that knows the backend's raw JSON shape (snake_case,
 * straight from SQLite). Every function here returns the app's domain
 * type — nothing downstream ever sees a snake_case field.
 */

// Shape of one row exactly as api.py's `dict(r)` serializes it.
interface TicketApiRow {
  ticket_id: number;
  received_at: string;
  raw_text: string;
  tag: Ticket["tag"];
  confidence: number;
  order_id: string | null;
  product_id: number | null;
  resolution_text: string;
  outcome: Ticket["outcome"];
  processed_by: string;
}

function fromApiRow(row: TicketApiRow): Ticket {
  return {
    ticketId: row.ticket_id,
    receivedAt: row.received_at,
    rawText: row.raw_text,
    tag: row.tag,
    confidence: row.confidence,
    orderId: row.order_id,
    productId: row.product_id,
    resolutionText: row.resolution_text,
    outcome: row.outcome,
    processedBy: row.processed_by,
  };
}

/** GET /api/tickets — the full audit log, most recent first. */
export async function fetchTicketLog(): Promise<Ticket[]> {
  const rows = await apiFetch<TicketApiRow[]>("/api/tickets");
  return rows.map(fromApiRow);
}

// Shape of the response from POST /api/tickets (api.py, create_ticket()).
interface ProcessTicketApiResponse {
  tag: Ticket["tag"];
  confidence: number;
  outcome: Ticket["outcome"];
  reply: string;
  reason: string | null;
}

/** POST /api/tickets — classify + resolve + log one raw ticket message. */
export async function submitTicket(text: string): Promise<ProcessTicketResult> {
  const data = await apiFetch<ProcessTicketApiResponse>("/api/tickets", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return {
    tag: data.tag,
    confidence: data.confidence,
    outcome: data.outcome,
    reply: data.reply,
    reason: data.reason ?? null,
  };
}
