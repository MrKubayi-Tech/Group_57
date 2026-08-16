import { useTicketAutomation } from "../hooks/useTicketAutomation";
import { StatsBar } from "../components/StatsBar";
import { QueueList } from "../components/QueueList";
import { IncomingTicketCard } from "../components/IncomingTicketCard";
import { TicketCard } from "../components/TicketCard";
import { TicketComposer } from "../components/TicketComposer";

export function Dashboard() {
  const { incoming, snapshot, stats, loadingLog, running, error, runAutomation, refreshLog } =
    useTicketAutomation();

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">Northstar Retail Co. · Support Ops</p>
          <h1 className="dashboard__title">Ticket Automation</h1>
        </div>
        <button
          type="button"
          className="run-button"
          onClick={runAutomation}
          disabled={running || incoming.length === 0}
        >
          {running
            ? "Running…"
            : incoming.length === 0
              ? "Queue cleared"
              : `Run automation (${incoming.length})`}
        </button>
      </header>

      {error && (
        <div className="dashboard__status dashboard__status--error">
          <p>{error}</p>
          <button type="button" onClick={refreshLog}>
            Retry
          </button>
        </div>
      )}

      <StatsBar stats={stats} />

      <TicketComposer onSubmitted={refreshLog} />

      <QueueList
        title="Incoming — before automation"
        items={incoming}
        emptyLabel="Queue is empty — every sample ticket has been processed."
        getKey={(t) => t.clientId}
        renderItem={(t) => <IncomingTicketCard ticket={t} />}
      />

      {loadingLog && !snapshot ? (
        <p className="dashboard__status">Loading ticket log…</p>
      ) : (
        snapshot && (
          <>
            <QueueList
              title="Auto-resolved — after automation"
              items={snapshot.resolved}
              emptyLabel="Nothing auto-resolved yet — run the automation above."
              getKey={(t) => t.ticketId}
              renderItem={(t) => <TicketCard ticket={t} />}
              pageSize={6}
            />
            <QueueList
              title="Escalated to a human agent"
              items={snapshot.escalated}
              emptyLabel="Nothing escalated yet."
              getKey={(t) => t.ticketId}
              renderItem={(t) => <TicketCard ticket={t} />}
            />
          </>
        )
      )}
    </div>
  );
}