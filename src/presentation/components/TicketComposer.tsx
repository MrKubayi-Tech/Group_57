import { useState, type FormEvent } from "react";
import { submitTicket } from "../../data";
import type { ProcessTicketResult } from "../../domain";

interface TicketComposerProps {
  onSubmitted: () => void;
}

export function TicketComposer({ onSubmitted }: TicketComposerProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ProcessTicketResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await submitTicket(trimmed);
      setResult(res);
      setText("");
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit that ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="composer">
      <h3 className="queue-list__title">Try a ticket live</h3>
      <form className="composer__form" onSubmit={handleSubmit}>
        <input
          className="composer__input"
          type="text"
          placeholder='e.g. "Has NS-10432 shipped yet?"'
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !text.trim()}>
          {submitting ? "Sending…" : "Submit"}
        </button>
      </form>

      {error && <p className="composer__error">{error}</p>}

      {result && (
        <div className={`composer__result composer__result--${result.outcome}`}>
          <span className={`ticket-card__status ticket-card__status--${result.outcome === "auto_resolved" ? "resolved" : "escalated"}`}>
            {result.outcome === "auto_resolved" ? "Auto-resolved" : "Escalated"}
          </span>
          <p>{result.reply}</p>
        </div>
      )}
    </section>
  );
}
