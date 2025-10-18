# Cloudflare D1 Database Setup

1. First, create the database:
```bash
npx wrangler d1 create ovia-products
```

2. Add the database binding to wrangler.toml:
```toml
[[d1_databases]]
binding = "DB"
database_name = "ovia-products"
database_id = "YOUR_DATABASE_ID"
```

3. Run the setup SQL:
```bash
npx wrangler d1 execute ovia-products --file=./db-setup.sql
```

4. Test the database:
```bash
npx wrangler d1 execute ovia-products --command="SELECT * FROM products;"
```