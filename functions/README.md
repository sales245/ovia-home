# 🚀 Cloudflare Pages Functions - Backend API

Cloudflare Pages Functions ile JavaScript/TypeScript backend API.

## 📁 Yapı

```
functions/
├── api/
│   ├── products.js      # /api/products
│   ├── categories.js    # /api/categories
│   ├── stats.js         # /api/stats
│   ├── sheets.js        # /api/sheets (Google Sheets)
│   └── inquiries.js     # /api/inquiries
└── README.md
```

## 🔧 Özellikler

- ✅ **Otomatik Routing**: Dosya adı = endpoint
- ✅ **CORS Desteği**: Tüm origin'lerden erişim
- ✅ **Environment Variables**: Cloudflare'de güvenli saklama
- ✅ **Edge Computing**: Dünya çapında hızlı yanıt
- ✅ **Ücretsiz**: 100,000 istek/gün

## 🌐 API Endpoints

### Products
```bash
GET  /api/products      # Tüm ürünleri listele
POST /api/products      # Yeni ürün ekle
```

### Categories
```bash
GET  /api/categories    # Tüm kategorileri listele
```

### Statistics
```bash
GET  /api/stats         # Site istatistiklerini al
```

### Google Sheets
```bash
GET  /api/sheets        # Google Sheets'ten veri çek
```

### Inquiries
```bash
GET  /api/inquiries     # Tüm talepleri listele
POST /api/inquiries     # Yeni talep oluştur
```

## 🔐 Environment Variables (Cloudflare Pages)

Cloudflare Dashboard → Pages → Settings → Environment variables

```env
SPREADSHEET_ID=1Za8CAl0QQmYLAub6AFJUdtiK5Qry1Ono8qyYwE5EWfI
GOOGLE_API_KEY=your_google_api_key_here
```

## 📝 Google API Key Alma

1. [Google Cloud Console](https://console.cloud.google.com/)
2. "APIs & Services" → "Credentials"
3. "Create Credentials" → "API Key"
4. Restrict key → "Google Sheets API"
5. Kopyala ve Cloudflare'e ekle

## 🚀 Deploy

```bash
# 1. Değişiklikleri commit et
git add functions/
git commit -m "Add Cloudflare Functions backend"

# 2. GitHub'a push et
git push origin main

# 3. Cloudflare otomatik deploy eder! 🎉
```

## 🧪 Test

```bash
# Local test (wrangler ile)
npx wrangler pages dev

# Canlıda test
curl https://ovia-home.com/api/products
curl https://ovia-home.com/api/categories
curl https://ovia-home.com/api/stats
```

## 📊 Frontend Entegrasyonu

```javascript
// Frontend .env
REACT_APP_BACKEND_URL=https://ovia-home.com

// API çağrısı
const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products`);
const products = await response.json();
```

## 🔄 Google Sheets Entegrasyonu

### Option 1: Public Sheets (Basit)
- Sheet'i "Anyone with the link can view" yap
- API Key kullan
- ✅ Kolay setup
- ⚠️ Public olmalı

### Option 2: Service Account (Güvenli)
- Service Account oluştur
- Private key'i Cloudflare Secrets'e ekle
- ✅ Güvenli
- ⚠️ Daha karmaşık

## 💡 Gelişmiş Özellikler

### KV Storage (Veritabanı)
```javascript
// Cloudflare KV ile veri saklama
await env.MY_KV.put("product:1", JSON.stringify(product));
const product = await env.MY_KV.get("product:1", "json");
```

### D1 Database (SQL)
```javascript
// Cloudflare D1 ile SQL sorguları
const results = await env.DB.prepare(
  "SELECT * FROM products WHERE category = ?"
).bind("bathrobes").all();
```

### Email Gönderimi
```javascript
// MailChannels ile ücretsiz email
await fetch("https://api.mailchannels.net/tx/v1/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: "admin@ovia-home.com" }]
    }],
    from: { email: "noreply@ovia-home.com" },
    subject: "New Inquiry",
    content: [{ type: "text/plain", value: "..." }]
  })
});
```

## 🐛 Debugging

```bash
# Logları görüntüle
wrangler tail

# Cloudflare Dashboard'da
# Pages → Deployment → Functions logs
```

## 📖 Daha Fazla Bilgi

- [Cloudflare Pages Functions Docs](https://developers.cloudflare.com/pages/functions/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Cloudflare KV](https://developers.cloudflare.com/kv/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
