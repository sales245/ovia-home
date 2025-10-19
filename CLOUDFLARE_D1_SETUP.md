# Cloudflare D1 Database Setup for Ovia Home

## Prerequisites
- Cloudflare account with Pages and D1 access
- wrangler CLI installed (`npm install -g wrangler`)

## Step 1: Create D1 Database

```bash
# Login to Cloudflare
wrangler login

# Create a new D1 database
wrangler d1 create ovia-home-db
```

This will output your database ID. Copy it and update `wrangler.toml` file with the database_id.

## Step 2: Run Schema Migration

Execute the schema.sql file to create all tables:

```bash
wrangler d1 execute ovia-home-db --file=./schema.sql
```

Or manually in Cloudflare Dashboard:
1. Go to Cloudflare Dashboard > Workers & Pages > D1
2. Select your database
3. Go to Console tab
4. Copy and paste the content from `schema.sql`
5. Click "Execute"

## Step 3: Seed Initial Data

Execute the seed.sql file to add sample products and categories:

```bash
wrangler d1 execute ovia-home-db --file=./seed.sql
```

Or manually in Cloudflare Dashboard:
1. Go to D1 Console tab
2. Copy and paste the content from `seed.sql`
3. Click "Execute"

## Step 4: Configure Pages Function Binding

1. Go to your Cloudflare Pages project
2. Go to Settings > Functions
3. Add D1 Database Binding:
   - Variable name: `DB`
   - D1 database: Select your created database `ovia-home-db`
4. Save

## Step 5: Verify Setup

Test your API endpoints:

```bash
# Test products endpoint
curl https://ovia-home.com/api/products

# Test categories endpoint
curl https://ovia-home.com/api/categories

# Test stats endpoint
curl https://ovia-home.com/api/stats
```

## Database Schema Overview

### Tables Created:
1. **categories** - Product categories with multilingual support
2. **products** - Products with pricing tiers, features, and multilingual data
3. **inquiries** - Customer inquiry form submissions
4. **quotes** - Quote request submissions
5. **customers** - Registered customers
6. **orders** - Customer orders

### Sample Data Included:
- 4 Categories (Bathrobes, Towels, Bedding, Home Decor)
- 5 Sample Products with tiered pricing

## Troubleshooting

### Issue: "D1 binding not found"
**Solution:** Make sure you've added the D1 binding in Pages Settings > Functions with the exact name "DB"

### Issue: "Table doesn't exist"
**Solution:** Run the schema.sql migration again

### Issue: No products showing on website
**Solution:** 
1. Check if seed data was inserted: `wrangler d1 execute ovia-home-db --command "SELECT COUNT(*) FROM products"`
2. Check API response: Visit https://ovia-home.com/api/products directly in browser
3. Check browser console for errors

## Admin Credentials

- Username: `admin`
- Password: `oviahome2024`

Access admin panel at: https://ovia-home.com/admin

## Database Maintenance

### View all products:
```bash
wrangler d1 execute ovia-home-db --command "SELECT * FROM products"
```

### View all categories:
```bash
wrangler d1 execute ovia-home-db --command "SELECT * FROM categories"
```

### Delete all data:
```bash
wrangler d1 execute ovia-home-db --command "DELETE FROM products"
wrangler d1 execute ovia-home-db --command "DELETE FROM categories"
```

### Re-seed data:
```bash
wrangler d1 execute ovia-home-db --file=./seed.sql
```

## Next Steps

After setup is complete:
1. Deploy your site: `npm run deploy` or push to GitHub (if connected)
2. Test all endpoints
3. Access admin panel and add more products
4. Customize products and categories as needed
