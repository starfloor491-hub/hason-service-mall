CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  company TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  request TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT '접수',
  admin_memo TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
