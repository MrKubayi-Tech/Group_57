import type { IncomingTicket } from "../../domain";

interface IncomingTicketCardProps {
  ticket: IncomingTicket;
}

export function IncomingTicketCard({ ticket }: IncomingTicketCardProps) {
  return (
    <article className="ticket-card ticket-card--incoming">
      <header className="ticket-card__header">
        <span className="ticket-card__id">{ticket.clientId}</span>
        <span className="ticket-card__status ticket-card__status--incoming">Unprocessed</span>
      </header>
      <p className="ticket-card__message">{ticket.text}</p>
    </article>
  );
}
