import type { IncomingTicket } from "../domain";

/**
 * DATA LAYER (fixture)
 * The "before" queue — raw, unprocessed customer messages.
 *
 * Deliberately the SAME text as SAMPLE_TICKETS in automation.py, so
 * running the demo shows these exact messages move from "before" to
 * "after" — the backend and frontend teams agreed on this list together.
 * If Denise/Rodney change SAMPLE_TICKETS, update this list to match.
 */
export function getSampleIncomingQueue(): IncomingTicket[] {
  const messages = [
    "Has NS-10432 shipped yet?",
    "Do you have the Ridgeline Sneaker in size M?",
    "When will NS-88213 arrive?",
    "Is the Atlas Trail Jacket back in stock in a large?",
    "Where is order NS-99999??",
    "I want a refund for a damaged item",
    "Is the Voyager Backpack available?",
    "NS-55901 tracking please",
    "Do you carry the Ridgeline Sneaker in XL?",
    "My payment failed twice, please help",
  ];

  return messages.map((text, i) => ({ clientId: `sample-${i + 1}`, text }));
}
