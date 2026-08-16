import sqlite3

conn = sqlite3.connect("northstar.db")

# List of all missing columns to add
columns_to_add = [
    "ALTER TABLE tickets ADD COLUMN ticket_id INTEGER;",
    "ALTER TABLE tickets ADD COLUMN received_at TEXT;",
    "ALTER TABLE tickets ADD COLUMN raw_text TEXT;",
    "ALTER TABLE tickets ADD COLUMN tag TEXT;",
    "ALTER TABLE tickets ADD COLUMN confidence REAL;",
    "ALTER TABLE tickets ADD COLUMN order_id TEXT;",
    "ALTER TABLE tickets ADD COLUMN product_id INTEGER;",
    "ALTER TABLE tickets ADD COLUMN resolution_text TEXT;",
    "ALTER TABLE tickets ADD COLUMN outcome TEXT;",
    "ALTER TABLE inventory ADD COLUMN stock_status TEXT DEFAULT 'In Stock';",
    "ALTER TABLE orders ADD COLUMN note TEXT;",
    "ALTER TABLE orders ADD COLUMN eta TEXT;",
]

# Run them one by one, ignoring errors if the column already exists
for query in columns_to_add:
    try:
        conn.execute(query)
        print(f"Success: {query}")
    except sqlite3.OperationalError as e:
        print(f"Skipped (already exists): {query}")

conn.commit()
conn.close()
print("\nDatabase updated successfully!")


import sqlite3

conn = sqlite3.connect("northstar.db")

# Fill any existing NULL values just in case
conn.execute("UPDATE tickets SET message = '' WHERE message IS NULL;")

# If using raw SQLite, make sure your insertion populates message or set default
conn.commit()
conn.close()
print("Updated message constraint handling.")
