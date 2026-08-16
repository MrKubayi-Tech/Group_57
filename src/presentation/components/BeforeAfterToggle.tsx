import type { QueueView } from "../hooks/useTicketQueue";

interface BeforeAfterToggleProps {
  view: QueueView;
  onChange: (view: QueueView) => void;
}

export function BeforeAfterToggle({ view, onChange }: BeforeAfterToggleProps) {
  return (
    <div className="toggle" role="tablist" aria-label="Queue view">
      <button
        type="button"
        role="tab"
        aria-selected={view === "before"}
        className={`toggle__option ${view === "before" ? "toggle__option--active" : ""}`}
        onClick={() => onChange("before")}
      >
        Before automation
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "after"}
        className={`toggle__option ${view === "after" ? "toggle__option--active" : ""}`}
        onClick={() => onChange("after")}
      >
        After automation
      </button>
    </div>
  );
}
