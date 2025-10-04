# Database Setup Commands

**IMPORTANT: Make sure you're in the /workspaces/ovia-home directory when running these commands**

Copy and paste these commands one by one into your terminal:

## 1. First, verify your database exists:
```bash
npx wrangler d1 list
```

## 2. Create Products Table
```bash
npx wrangler d1 execute database1 --command "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, name_en TEXT NOT NULL, name_tr TEXT NOT NULL, name_de TEXT, image TEXT, features_en TEXT, features_tr TEXT, badges TEXT, retail_price REAL, wholesale_price REAL, min_wholesale_quantity INTEGER DEFAULT 1, in_stock BOOLEAN DEFAULT 1, stock_quantity INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
```

## 2. Create Categories Table
```bash
npx wrangler d1 execute database1 --command "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name_en TEXT NOT NULL, name_tr TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, image TEXT, sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT 1);"
```

## 3. Create Inquiries Table
```bash
npx wrangler d1 execute database1 --command "CREATE TABLE IF NOT EXISTS inquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT, message TEXT NOT NULL, status TEXT DEFAULT 'new', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
```

## 4. Insert Sample Categories
```bash
npx wrangler d1 execute database1 --command "INSERT INTO categories (name_en, name_tr, slug, is_active) VALUES ('Bathrobes', 'Bornozlar', 'bathrobes', 1), ('Towels', 'Havlular', 'towels', 1), ('Bed Linens', 'Yatak Takımları', 'bed-linens', 1);"
```

## 5. Insert Sample Products
```bash
npx wrangler d1 execute database1 --command "INSERT INTO products (category, name_en, name_tr, features_en, features_tr, badges, retail_price, wholesale_price, min_wholesale_quantity, stock_quantity) VALUES ('bathrobes', 'Premium Cotton Bathrobe', 'Premium Pamuklu Bornoz', '[\"100% Turkish Cotton\", \"Ultra Soft\", \"Quick Dry\"]', '[\"100% Türk Pamuğu\", \"Ekstra Yumuşak\", \"Hızlı Kuruyan\"]', 'premium,organic', 99.99, 79.99, 50, 150);"
```

```bash
npx wrangler d1 execute database1 --command "INSERT INTO products (category, name_en, name_tr, features_en, features_tr, badges, retail_price, wholesale_price, min_wholesale_quantity, stock_quantity) VALUES ('towels', 'Turkish Towel Set', 'Türk Havlu Seti', '[\"600 GSM\", \"Highly Absorbent\", \"Durable\"]', '[\"600 GSM\", \"Yüksek Emici\", \"Dayanıklı\"]', 'bestseller', 49.99, 39.99, 100, 300);"
```

## 6. Verify Data
```bash
npx wrangler d1 execute database1 --command "SELECT * FROM categories;"
```

```bash
npx wrangler d1 execute database1 --command "SELECT * FROM products;"
```

Run these commands one by one in your terminal!