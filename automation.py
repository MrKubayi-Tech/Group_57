"""
Northstar Support Deflection — automation engine.

This is the "backend script/automation that auto-tags or auto-resolves
tickets before a human sees them" deliverable. It is deliberately
rule-based, not ML: the sprint brief is a 1-week (here: 1-day) MVP, and
a transparent, debuggable classifier is easier for Northstar's own team
to pick up without your team in the room (see the go-live note).

Usage:
    python automation.py init          # create + seed the database
    python automation.py process "Has order NS-10432 shipped yet?"
    python automation.py batch         # run the built-in sample tickets
    python automation.py log           # print the ticket audit log
"""

import re
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "northstar.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"
SEED_PATH = Path(__file__).parent / "seed_data.sql"

ORDER_ID_RE = re.compile(r"\bNS-\d{4,6}\b", re.IGNORECASE)
ORDER_KEYWORDS = [
    "order",
    "ship",
    "shipped",
    "shipping",
    "tracking",
    "deliver",
    "arrive",
    "dispatch",
]
STOCK_KEYWORDS = [
    "stock",
    "back in stock",
    "restock",
    "available",
    "size",
    "have this",
    "carry",
]

CONFIDENCE_ESCALATE_DEFAULT = 0.31


# ---------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create the schema and load mock data. Safe to re-run: drops first."""
    conn = get_connection()
    conn.executescript("""
        DROP TABLE IF EXISTS tickets;
        DROP TABLE IF EXISTS inventory;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS orders;
    """)
    conn.executescript(SCHEMA_PATH.read_text())
    conn.executescript(SEED_PATH.read_text())
    conn.commit()
    conn.close()
    print(f"Initialized {DB_PATH} with schema + mock data.")


# ---------------------------------------------------------------
# Classification
# ---------------------------------------------------------------
def find_product(conn, text_lower):
    """Return the products row whose name appears in the ticket text, or None."""
    products = conn.execute("SELECT * FROM products").fetchall()
    for p in products:
        if p["name"].lower() in text_lower:
            return p
    return None


def find_size(text_lower, sizes):
    # Check longer size codes first (e.g. 'xl' before 'l') so 'XL' can't be
    # matched as a substring of the shorter code 'L'.
    for s in sorted(sizes, key=len, reverse=True):
        if re.search(rf"\b{re.escape(s)}\b", text_lower):
            return s
    return None


def classify(conn, text):
    """
    Rule-based classifier. Returns a dict describing the tag, confidence,
    and enough context to build a reply (or explain the escalation).
    Mirrors the logic used in the frontend demo so both stay in sync.
    """
    t = text.lower()
    order_id_match = ORDER_ID_RE.search(t)

    order_score = sum(1 for k in ORDER_KEYWORDS if k in t) + (
        2 if order_id_match else 0
    )
    stock_score = sum(1 for k in STOCK_KEYWORDS if k in t)

    product = find_product(conn, t)
    if product:
        stock_score += 2

    if order_score == 0 and stock_score == 0:
        return {
            "tag": "escalate",
            "confidence": CONFIDENCE_ESCALATE_DEFAULT,
            "reason": "No order-status or stock-availability signal found in the message.",
        }

    if order_score >= stock_score:
        confidence = min(0.55 + order_score * 0.12, 0.97)
        if not order_id_match:
            return {
                "tag": "escalate",
                "confidence": min(confidence, 0.58),
                "reason": "Order-status intent detected, but no order ID (format NS-#####) found to look up.",
            }
        order_id = order_id_match.group(0).upper()
        order = conn.execute(
            "SELECT * FROM orders WHERE order_id = ?", (order_id,)
        ).fetchone()
        if not order:
            return {
                "tag": "escalate",
                "confidence": 0.62,
                "reason": f"Order ID {order_id} not found in order table — needs a human to check the source system.",
            }
        return {
            "tag": "order",
            "confidence": confidence,
            "order_id": order_id,
            "order": order,
        }

    else:
        confidence = min(0.55 + stock_score * 0.12, 0.97)
        if not product:
            return {
                "tag": "escalate",
                "confidence": min(confidence, 0.60),
                "reason": "Stock-availability intent detected, but the product name wasn't recognized against the catalog.",
            }
        rows = conn.execute(
            "SELECT * FROM inventory WHERE product_id = ?", (product["product_id"],)
        ).fetchall()
        sizes = {r["size"]: r["stock_status"] for r in rows}
        size_match = find_size(t, sizes.keys())
        return {
            "tag": "stock",
            "confidence": confidence,
            "product": product,
            "sizes": sizes,
            "size_match": size_match,
        }


# ---------------------------------------------------------------
# Response generation
# ---------------------------------------------------------------
def build_reply(result):
    if result["tag"] == "order":
        o = dict(result["order"]) if result.get("order") else {}

        status = o.get("status", "in progress")
        carrier = o.get("carrier")
        carrier_part = f" with {carrier}" if carrier else ""

        note = f" {o['note']}" if o.get("note") else ""
        eta = f" Estimated: {o['eta']}." if o.get("eta") else ""

        return (
            f"Hi! Order {result['order_id']} is currently {status}{carrier_part}."
            f"{note}{eta}"
        )

    if result["tag"] == "stock":
        name = result["product"]["name"]
        if result["size_match"]:
            status = result["sizes"][result["size_match"]]
            return f"The {name} in size {result['size_match'].upper()}: {status}."
        lines = " · ".join(f"{s.upper()}: {v}" for s, v in result["sizes"].items())
        return f"Here's current availability for the {name} — {lines}. Let us know which size you need and we'll confirm."

    return f"This one's been routed to a human agent — {result['reason']}"


# ---------------------------------------------------------------
# Main processing entrypoint (this is what a real ticket webhook would call)
# ---------------------------------------------------------------
def process_ticket(text):
    conn = get_connection()
    result = classify(conn, text)
    reply = build_reply(result)
    outcome = "escalated" if result["tag"] == "escalate" else "auto_resolved"

    conn.execute(
        """INSERT INTO tickets (
           received_at, raw_text, message, tag, confidence, order_id, product_id, resolution_text, outcome
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            datetime.now(timezone.utc).isoformat(timespec="seconds"),
            text,
            text,
            result["tag"],
            round(result["confidence"], 2),
            result.get("order_id"),
            result["product"]["product_id"] if result.get("product") else None,
            reply,
            outcome,
        ),
    )
    conn.commit()
    conn.close()

    return {
        "tag": result["tag"],
        "confidence": round(result["confidence"], 2),
        "outcome": outcome,
        "reply": reply,
        "reason": result.get("reason"),
    }


SAMPLE_TICKETS = [
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
]


def print_result(text, r):
    print(f"\n> {text}")
    print(f"  tag={r['tag']}  confidence={r['confidence']}  outcome={r['outcome']}")
    print(f"  reply: {r['reply']}")


def show_log():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM tickets ORDER BY ticket_id").fetchall()
    if not rows:
        print("No tickets logged yet. Run `python automation.py batch` first.")
        return
    for row in rows:
        print(
            f"#{row['ticket_id']:>3}  {row['received_at']}  "
            f"[{row['tag']:<8}] conf={row['confidence']:<4} -> {row['outcome']:<13}  "
            f"\"{row['raw_text']}\""
        )
    conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    command = sys.argv[1]

    if command == "init":
        init_db()

    elif command == "process":
        if len(sys.argv) < 3:
            print('Usage: python automation.py process "ticket text here"')
            sys.exit(1)
        r = process_ticket(sys.argv[2])
        print_result(sys.argv[2], r)

    elif command == "batch":
        for text in SAMPLE_TICKETS:
            r = process_ticket(text)
            print_result(text, r)

    elif command == "log":
        show_log()

    else:
        print(f"Unknown command: {command}")
        print(__doc__)
