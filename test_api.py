import unittest
import json
import sqlite3
from unittest.mock import patch
from api import app


class TestAPIEndpoints(unittest.TestCase):

    def setUp(self):
        """Set up Flask test client and isolated SQLite database."""
        app.config["TESTING"] = True
        self.client = app.test_client()

        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript("""
            CREATE TABLE tickets (
                ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
                received_at TEXT,
                raw_text TEXT,
                tag TEXT,
                confidence REAL,
                order_id TEXT,
                product_id INTEGER,
                resolution_text TEXT,
                outcome TEXT
            );
        """)

    def tearDown(self):
        self.conn.close()

    @patch("api.process_ticket")
    def test_create_ticket_success(self, mock_process_ticket):
        """Test POST /api/tickets with valid text payload."""
        mock_process_ticket.return_value = {
            "tag": "order",
            "confidence": 0.91,
            "outcome": "auto_resolved",
            "reply": "Hi! Order NS-10432 is currently Shipped.",
            "reason": None,
        }

        response = self.client.post(
            "/api/tickets",
            data=json.dumps({"text": "Has NS-10432 shipped?"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data["outcome"], "auto_resolved")

    def test_create_ticket_missing_text(self):
        """Test POST /api/tickets validation with empty text."""
        response = self.client.post(
            "/api/tickets",
            data=json.dumps({"text": "   "}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Field 'text' is required.", response.get_json()["error"])

    @patch("api.get_connection")
    def test_list_tickets(self, mock_get_conn):
        """Test GET /api/tickets returns logged tickets."""
        self.conn.execute(
            "INSERT INTO tickets (raw_text, tag, outcome) VALUES ('Test query', 'order', 'auto_resolved')"
        )
        self.conn.commit()
        mock_get_conn.return_value = self.conn

        response = self.client.get("/api/tickets")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["raw_text"], "Test query")

    @patch("api.get_connection")
    def test_stats_calculation(self, mock_get_conn):
        """Test GET /api/stats query aggregations and deflection rate calculation."""
        # Seed 3 auto_resolved order tickets and 1 escalated ticket
        self.conn.execute(
            "INSERT INTO tickets (tag, outcome) VALUES ('order', 'auto_resolved')"
        )
        self.conn.execute(
            "INSERT INTO tickets (tag, outcome) VALUES ('order', 'auto_resolved')"
        )
        self.conn.execute(
            "INSERT INTO tickets (tag, outcome) VALUES ('stock', 'auto_resolved')"
        )
        self.conn.execute(
            "INSERT INTO tickets (tag, outcome) VALUES ('escalate', 'escalated')"
        )
        self.conn.commit()
        mock_get_conn.return_value = self.conn

        response = self.client.get("/api/stats")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()

        self.assertEqual(data["total_tickets"], 4)
        self.assertEqual(data["auto_resolved"], 3)
        self.assertEqual(data["escalated"], 1)
        self.assertEqual(data["order_status"], 2)
        self.assertEqual(data["stock_availability"], 1)
        self.assertEqual(data["deflection_rate"], 75)


if __name__ == "__main__":
    unittest.main()
