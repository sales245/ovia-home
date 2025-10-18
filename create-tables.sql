-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_tr TEXT NOT NULL,
    name_de TEXT,
    image TEXT,
    features_en TEXT,
    features_tr TEXT,
    badges TEXT,
    min_wholesale_quantity INTEGER DEFAULT 1,
    stock_quantity INTEGER DEFAULT 0,
    in_stock INTEGER DEFAULT 1,
    price_tiers TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);