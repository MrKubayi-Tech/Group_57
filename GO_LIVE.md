# Go-live readiness note — what Northstar's team needs to know

> **1-PAGE HANDOFF**

---

## What Works Today

- **Ticket Classification:** Classifies `order-status` and `stock-availability` tickets from free text, displaying a confidence score per ticket.
- **Order-Status Resolution:** Order-status tickets resolve against a mock order table (`ID` → `status`, `carrier`, `ETA`) and reply with real tracking details.
- **Stock-Availability Resolution:** Stock tickets resolve against a mock inventory table (`product` + `size` → `in stock` / `restock date`).
- **Automated Escalation:** Anything below the confidence threshold, or missing an order ID / product match, auto-escalates to the human queue instead of guessing.

---

## Known-Broken / Out of Scope

- **Returns & Refunds Category:** Not built — everything in this category currently escalates to the human queue.
- **Mock Data Dependencies:** Order and inventory data are hard-coded mocks, not a live connection to Northstar's order system.
- **Rule-Based Classifier:** Classifier is keyword/rule-based, not ML — will misfire on phrasing it hasn't seen; needs a real test set before go-live.
- **Authentication & Inbox Integration:** No auth layer — this build is a demo console, not wired to the real ticket inbox yet.
