export const SCHEMA = {
  secrets: `
    CREATE TABLE IF NOT EXISTS secrets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      username TEXT,
      password TEXT NOT NULL, -- Encrypted
      uri TEXT,
      notes TEXT, -- Encrypted
      category TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `,
  transactions: `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSE')),
      category TEXT,
      note TEXT,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `,
  debts: `
    CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_name TEXT NOT NULL,
      amount REAL NOT NULL, -- Positive: You lent, Negative: You borrowed
      description TEXT,
      due_date TEXT,
      is_settled INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `,
  notes: `
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      tags TEXT,
      is_pinned INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `,
  bills: `
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_uri TEXT,
      merchant_name TEXT,
      date TEXT,
      total_amount REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `,
  bill_items: `
    CREATE TABLE IF NOT EXISTS bill_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER NOT NULL,
      description TEXT,
      quantity REAL,
      unit_price REAL,
      total_price REAL,
      FOREIGN KEY (bill_id) REFERENCES bills (id) ON DELETE CASCADE
    );
  `
};
