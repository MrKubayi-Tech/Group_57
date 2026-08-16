import type { Ticket } from "../../domain";

interface TicketCardProps {
  ticket: Ticket;
}

const TAG_LABEL: Record<Ticket["tag"], string> = {
  order: "Order status",
  stock: "Stock availability",
  escalate: "Uncategorized",
};

export function TicketCard({ ticket }: TicketCardProps) {
  const isResolved = ticket.outcome === "auto_resolved";

  return (
    <article className={`ticket-card ticket-card--${isResolved ? "resolved" : "escalated"}`}>
      <header className="ticket-card__header">
        <span className="ticket-card__id">#{ticket.ticketId}</span>
        <span className={`ticket-card__status ticket-card__status--${isResolved ? "resolved" : "escalated"}`}>
          {isResolved ? "Auto-resolved" : "Escalated"}
        </span>
      </header>

      <p className="ticket-card__message">{ticket.rawText}</p>

      <footer className="ticket-card__footer">
        <span className="ticket-card__category">
          {TAG_LABEL[ticket.tag]} · confidence {Math.round(ticket.confidence * 100)}%
          {ticket.orderId ? ` · ${ticket.orderId}` : ""}
        </span>
        <p className={isResolved ? "ticket-card__resolution" : "ticket-card__matched"}>
          {ticket.resolutionText}
        </p>
      </footer>
    </article>
  );
}
