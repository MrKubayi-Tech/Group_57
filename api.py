"""
Northstar Support Deflection — thin API over automation.py.

Run:
    pip install flask flask-cors
    python automation.py init      # first time only
    python api.py                  # serves on http://localhost:5000

Endpoints:
    POST /api/tickets   {"text": "..."}   -> classify + resolve + log one ticket
    GET  /api/tickets                     -> full audit log, most recent first
    GET  /api/stats                       -> totals for the dashboard
"""

from flask import Flask, jsonify, request
from flask_cors import CORS

from automation import get_connection, process_ticket

app = Flask(__name__)
CORS(
    app
)  # allow the static HTML frontend (served from file:// or another port) to call this


@app.post("/api/tickets")
def create_ticket():
    body = request.get_json(silent=True) or {}
    text = (body.get("text") or "").strip()
    if not text:
        return jsonify({"error": "Field 'text' is required."}), 400
    result = process_ticket(text)
    return jsonify(result), 201


@app.get("/api/tickets")
def list_tickets():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM tickets ORDER BY ticket_id DESC LIMIT 100"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.get("/api/stats")
def stats():
    """
    Every number here comes from a live query against the tickets table —
    nothing is counted or cached in the frontend.
    """
    conn = get_connection()
    total = conn.execute("SELECT COUNT(*) c FROM tickets").fetchone()["c"]
    resolved = conn.execute(
        "SELECT COUNT(*) c FROM tickets WHERE outcome = 'auto_resolved'"
    ).fetchone()["c"]
    order_count = conn.execute(
        "SELECT COUNT(*) c FROM tickets WHERE tag = 'order'"
    ).fetchone()["c"]
    stock_count = conn.execute(
        "SELECT COUNT(*) c FROM tickets WHERE tag = 'stock'"
    ).fetchone()["c"]
    conn.close()

    escalated = total - resolved
    rate = round(resolved / total * 100) if total else 0

    return jsonify(
        {
            "total_tickets": total,
            "auto_resolved": resolved,
            "escalated": escalated,
            "order_status": order_count,
            "stock_availability": stock_count,
            "deflection_rate": rate,
        }
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
