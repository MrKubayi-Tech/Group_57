import type { DashboardStats } from "../../domain";

interface StatsBarProps {
  stats: DashboardStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="stats-bar">
      <Stat label="Total tickets" value={stats.totalTickets} />
      <Stat label="Auto-resolved" value={stats.autoResolved} tone="resolved" />
      <Stat label="Escalated" value={stats.escalated} tone="escalated" />
      <Stat label="Order status" value={stats.orderStatus} />
      <Stat label="Stock availability" value={stats.stockAvailability} />
      <Stat label="Deflection rate" value={`${stats.deflectionRatePct}%`} tone="headline" />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "resolved" | "escalated" | "headline";
}) {
  return (
    <div className={`stat stat--${tone ?? "default"}`}>
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}
