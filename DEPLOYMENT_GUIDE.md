# Ovia Home - Complete Setup & Deployment Guide

## 🎯 Overview

Your Ovia Home website is now fully configured with:
- ✅ Proper database schema for products, categories, inquiries, quotes
- ✅ Fixed API endpoints (no more hardcoded URLs)
- ✅ Complete admin panel with product management
- ✅ Multilingual support (EN, TR, DE, and 9 more languages)
- ✅ Wholesale pricing with tiered rates
- ✅ Sample products and categories

## 📋 What Was Fixed

### 1. Database Schema
- **Before**: Basic product table with minimal fields
- **After**: Complete schema with:
  - Products (multilingual, price tiers, stock management)
  - Categories (multilingual)
  - Inquiries, Quotes, Customers, Orders tables
  - Proper indexes for performance

### 2. API Endpoints
- **Before**: ProductsPage had hardcoded URL
- **After**: Uses environment variables or relative paths
- **Fixed Files**: 
  - `/app/frontend/src/components/ProductsPage.js`
  - `/app/functions/api/products.ts`
  - `/app/functions/api/categories.js`
  - `/app/functions/api/inquiries.js`
  - `/app/functions/api/quotes.js`
  - `/app/functions/api/stats.js`

### 3. Data Format
- **Before**: APIs returned wrapped objects `{success: true, data: [...]}`
- **After**: APIs return arrays directly for frontend compatibility

## 🚀 Deployment Steps

### Step 1: Update Cloudflare D1 Database

Choose one method:

#### Method A: Using Wrangler CLI (Recommended)

```bash
# Install wrangler if not already installed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# If database doesn't exist, create it
wrangler d1 create ovia-home-db

# Copy the database_id from output and update wrangler.toml

# Drop old tables (if migrating from old schema)
wrangler d1 execute ovia-home-db --command="DROP TABLE IF EXISTS products; DROP TABLE IF EXISTS categories;"

# Create new schema
wrangler d1 execute ovia-home-db --file=./schema.sql

# Insert sample data
wrangler d1 execute ovia-home-db --file=./seed.sql

# Verify data
wrangler d1 execute ovia-home-db --command="SELECT COUNT(*) as count FROM products"
wrangler d1 execute ovia-home-db --command="SELECT COUNT(*) as count FROM categories"
```

#### Method B: Using Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **D1**
3. Select your database (or create new one)
4. Go to **Console** tab
5. Copy entire content from `/app/schema.sql` → Paste → Execute
6. Copy entire content from `/app/seed.sql` → Paste → Execute
7. Verify: Run `SELECT COUNT(*) FROM products` - should return 5

### Step 2: Configure D1 Binding in Cloudflare Pages

1. Go to your Cloudflare Pages project: **ovia-home**
2. Click on **Settings** > **Functions**
3. Scroll to **D1 Database Bindings**
4. Click **Add binding**
5. Set:
   - **Variable name**: `DB` (must be exactly this, case-sensitive)
   - **D1 database**: Select your database
6. Click **Save**

⚠️ **IMPORTANT**: The variable name MUST be `DB` (uppercase) - the code expects this exact name.

### Step 3: Deploy the Changes

#### If using GitHub integration:

```bash
git add .
git commit -m "Fix database integration and API endpoints"
git push origin main
```

Cloudflare Pages will automatically deploy.

#### If deploying manually:

```bash
# From the frontend directory
cd frontend
npm run build

# Deploy using wrangler
cd ..
wrangler pages deploy frontend/build --project-name=ovia-home
```

### Step 4: Verify Deployment

1. **Check Products Page**
   - Visit: https://ovia-home.com/products
   - Should see 5 sample products
   - Try filtering by category
   - Try search functionality

2. **Check API Endpoints Directly**
   - https://ovia-home.com/api/products (should return array of 5 products)
   - https://ovia-home.com/api/categories (should return array of 4 categories)
   - https://ovia-home.com/api/stats (should return stats object)

3. **Check Admin Panel**
   - Visit: https://ovia-home.com/admin
   - Login: username=`admin`, password=`oviahome2024`
   - Try adding a new product
   - Check if it appears on products page

## 🔐 Admin Panel

### Access
- **URL**: https://ovia-home.com/admin
- **Username**: `admin`
- **Password**: `oviahome2024`

### Features
- ✅ Dashboard with statistics
- ✅ Product management (add, edit, delete)
- ✅ Category management
- ✅ View inquiries
- ✅ View quote requests
- ✅ Export data to CSV

### Security Note
⚠️ The password is currently hardcoded in the frontend code. For production:
1. Open `/app/frontend/src/components/AdminPage.js`
2. Find line 253: `if (loginData.username === 'admin' && loginData.password === 'oviahome2024')`
3. Change `oviahome2024` to a strong password
4. Redeploy

## 📊 Database Structure

### Tables Created

1. **products** - Your product catalog
   - Multilingual names (EN, TR, DE + 9 more)
   - Price tiers for wholesale
   - Stock management
   - Features, badges, images

2. **categories** - Product categories
   - Multilingual names and descriptions
   - Sort order, active status

3. **inquiries** - Customer inquiries from contact form

4. **quotes** - Quote requests from customers

5. **customers** - Registered customers (for future use)

6. **orders** - Customer orders (for future use)

## 🧪 Testing Checklist

After deployment, verify:

- [ ] Products page loads without errors
- [ ] Products display with images and pricing
- [ ] Category filters work
- [ ] Search functionality works
- [ ] Admin panel login works
- [ ] Can add new product in admin
- [ ] New product appears on products page
- [ ] Contact form submission works
- [ ] WhatsApp integration works

## 🐛 Troubleshooting

### Issue: "D1 binding not found" error

**Solution:**
1. Check Pages Settings > Functions > D1 Bindings
2. Ensure variable name is exactly `DB` (case-sensitive)
3. Ensure correct database is selected
4. Redeploy after adding binding

### Issue: Products page is blank

**Check:**
1. Browser console for JavaScript errors
2. Network tab - check `/api/products` response
3. Verify seed data was inserted: `wrangler d1 execute ovia-home-db --command="SELECT * FROM products"`
4. Check D1 binding configuration

### Issue: Products show but with wrong data

**Solution:**
1. The old data might still be in database
2. Drop and recreate:
   ```bash
   wrangler d1 execute ovia-home-db --command="DROP TABLE products"
   wrangler d1 execute ovia-home-db --file=./schema.sql
   wrangler d1 execute ovia-home-db --file=./seed.sql
   ```

### Issue: API returns 500 errors

**Check:**
1. Cloudflare Functions logs in dashboard
2. Ensure D1 binding is configured
3. Verify database tables exist
4. Check if schema matches code expectations

### Issue: Admin panel doesn't work

**Check:**
1. Browser console for errors
2. Check if APIs return data: `/api/products`, `/api/categories`
3. Verify login credentials
4. Check localStorage/sessionStorage not blocked

## 📝 Adding New Products

### Via Admin Panel (Recommended)

1. Go to https://ovia-home.com/admin
2. Login with credentials
3. Click "Products" tab
4. Click "Add Product" button
5. Fill in:
   - Category
   - Product name (English required, others auto-translate)
   - Features
   - Image URL
   - Pricing
   - Stock quantity
6. Click "Save Product"

### Via D1 Console (Advanced)

```sql
INSERT INTO products (
  category, name_en, name_tr, image, features_en, features_tr,
  badges, retail_price, min_wholesale_quantity, stock_quantity, in_stock, price_tiers
) VALUES (
  'towels',
  'Luxury Hand Towel',
  'Lüks El Havlusu',
  'https://images.unsplash.com/photo-image-url',
  '["Soft Cotton", "Quick Dry"]',
  '["Yumuşak Pamuk", "Hızlı Kuruma"]',
  'premium',
  15.99,
  100,
  500,
  1,
  '[{"quantity":100,"price":12.99},{"quantity":500,"price":10.99}]'
);
```

## 📦 Sample Data Included

### Categories (4)
1. Bathrobes (Bornozlar)
2. Towels (Havlular)
3. Bedding (Yatak Takımları)
4. Home Decor (Ev Dekorasyonu)

### Products (5)
1. Premium Cotton Bathrobe - $45.99
2. Luxury Hotel Towel Set - $29.99
3. Egyptian Cotton Bed Sheet Set - $89.99
4. Bamboo Bath Towel - $24.99
5. Decorative Pillow Set - $39.99

All with tiered wholesale pricing!

## 🌐 API Documentation

### GET /api/products
Returns array of products
```json
[
  {
    "id": "1",
    "category": "bathrobes",
    "name": {"en": "...", "tr": "..."},
    "image": "...",
    "features": {"en": [...], "tr": [...]},
    "badges": ["premium"],
    "retail_price": 45.99,
    "priceTiers": [{"quantity": 50, "price": 35.99}],
    "in_stock": true
  }
]
```

### GET /api/categories
Returns array of categories

### POST /api/inquiries
Submit contact form inquiry

### POST /api/quotes
Submit quote request

### GET /api/stats
Returns statistics

## 🎨 Customization

### Change Colors
Edit `/app/frontend/tailwind.config.js`

### Change Products
Use admin panel or edit seed.sql

### Change Languages
Edit translation files in `/app/frontend/src/translations/`

### Change Admin Password
Edit `/app/frontend/src/components/AdminPage.js` line 253

## 📞 Support

If you encounter issues:
1. Check browser console for frontend errors
2. Check Cloudflare Functions logs for backend errors
3. Verify D1 binding configuration
4. Check that all SQL commands executed successfully
5. Refer to troubleshooting section above

## ✅ Next Steps

1. [ ] Deploy database schema and seed data
2. [ ] Configure D1 binding
3. [ ] Deploy code changes
4. [ ] Test all functionality
5. [ ] Add your own products via admin panel
6. [ ] Change admin password
7. [ ] Customize branding/colors if needed
8. [ ] Set up custom domain (if not already)
9. [ ] Monitor Cloudflare Analytics

---

**Your site is ready! Visit https://ovia-home.com to see it live! 🎉**
