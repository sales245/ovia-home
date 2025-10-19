-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en TEXT NOT NULL,
  name_tr TEXT NOT NULL,
  name_de TEXT,
  name_fr TEXT,
  name_it TEXT,
  name_es TEXT,
  name_pl TEXT,
  name_ru TEXT,
  name_bg TEXT,
  name_el TEXT,
  name_pt TEXT,
  name_ar TEXT,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_tr TEXT,
  description_de TEXT,
  image TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_tr TEXT NOT NULL,
  name_de TEXT,
  name_fr TEXT,
  name_it TEXT,
  name_es TEXT,
  name_pl TEXT,
  name_ru TEXT,
  name_bg TEXT,
  name_el TEXT,
  name_pt TEXT,
  name_ar TEXT,
  image TEXT,
  features_en TEXT DEFAULT '[]',
  features_tr TEXT DEFAULT '[]',
  features_de TEXT DEFAULT '[]',
  badges TEXT,
  retail_price REAL NOT NULL DEFAULT 0,
  min_wholesale_quantity INTEGER DEFAULT 50,
  stock_quantity INTEGER DEFAULT 0,
  in_stock INTEGER DEFAULT 1,
  price_tiers TEXT DEFAULT '[]',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  message TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  product_category TEXT,
  quantity INTEGER,
  message TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  country TEXT,
  address TEXT,
  customer_type TEXT DEFAULT 'retail',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  items TEXT NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
