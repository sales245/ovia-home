
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_tr TEXT NOT NULL,
  name_de TEXT,
  image TEXT,
  features_en TEXT,
  features_tr TEXT,
  badges TEXT,
  retail_price REAL,
  wholesale_price REAL,
  min_wholesale_quantity INTEGER DEFAULT 1,
  in_stock BOOLEAN DEFAULT 1,
  stock_quantity INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);