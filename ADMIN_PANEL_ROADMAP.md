# Admin Panel Roadmap - Google Sheets Database Integration

## 🎯 Amaç
Google Sheets'i database olarak kullanarak tam fonksiyonel admin panel oluşturmak.

## 📋 Yapılacaklar

### 1. Cloudflare Environment Variables (ÖNCELİKLİ)
```
Cloudflare Dashboard → Pages → ovia-home-web-page → Settings → Environment Variables

Eklenecekler:
- REACT_APP_BACKEND_URL = https://ovia-home.com
- GOOGLE_API_KEY = (Google Cloud Console'dan alınacak)
- SPREADSHEET_ID = 1Za8CAl0QQmYLAub6AFJUdtiK5Qry1Ono8qyYwE5EWfI (zaten var)
```

### 2. Google Sheets API Key Oluşturma
```
1. https://console.cloud.google.com/ → Proje seç/oluştur
2. "APIs & Services" → "Library" → "Google Sheets API" → Enable
3. "Credentials" → "Create Credentials" → "API Key"
4. API Key'i kopyala
5. "Restrict Key" → "Google Sheets API" seç
6. Cloudflare'e ekle
```

### 3. Google Sheets Yapısı
```
Sheet Adı: Products
Kolonlar:
- A: id
- B: category
- C: name_en
- D: name_tr
- E: name_de
- F: image
- G: features_en (JSON)
- H: features_tr (JSON)
- I: badges (comma separated)
- J: retail_price
- K: wholesale_price
- L: min_wholesale_quantity
- M: in_stock
- N: created_at
- O: updated_at

Sheet Adı: Categories
Kolonlar:
- A: id
- B: name_en
- C: name_tr
- D: slug
- E: image
- F: sort_order
- G: is_active

Sheet Adı: Inquiries
Kolonlar:
- A: id
- B: name
- C: email
- D: phone
- E: message
- F: status
- G: created_at

Sheet Adı: Quotes
Kolonlar:
- A: id
- B: customer_name
- C: company
- D: email
- E: phone
- F: product_id
- G: quantity
- H: message
- I: status
- J: created_at

Sheet Adı: Customers
Kolonlar:
- A: id
- B: name
- C: company
- D: email
- E: phone
- F: country
- G: total_orders
- H: total_spent
- I: created_at
- J: status
```

### 4. Backend API Geliştirmeleri

#### A. sheets.js - Okuma İşlemi (TAMAMLANACAK)
```javascript
// GET /api/sheets?sheet=Products
// Belirli bir sheet'i oku ve JSON olarak döndür
```

#### B. products.js - CRUD İşlemleri
```javascript
// GET /api/products - Tüm ürünleri listele (sheets.js'ten çek)
// POST /api/products - Yeni ürün ekle (Sheets'e yaz)
// PUT /api/products/:id - Ürün güncelle (Sheets'te güncelle)
// DELETE /api/products/:id - Ürün sil (Sheets'ten sil)
```

#### C. categories.js - CRUD İşlemleri
```javascript
// Aynı CRUD yapısı
```

#### D. inquiries.js - Yazma İşlemi
```javascript
// POST /api/inquiries - Yeni inquiry Sheets'e eklenecek
```

#### E. Google Sheets Write API Entegrasyonu
```javascript
// Sheets'e yazma için Google Sheets API v4 kullanılacak
// Method: spreadsheets.values.append
// Endpoint: https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}:append
```

### 5. Admin Panel Yeniden Yapılandırma

#### A. Dashboard (Ana Sayfa)
- ✅ İstatistikler (stats API'den)
- ✅ Son inquiry'ler
- ✅ Son quote'lar
- ✅ Hızlı aksiyonlar

#### B. Products Tab
- [ ] Tüm ürünleri listele (GET /api/products)
- [ ] Yeni ürün ekle formu (POST /api/products)
- [ ] Ürün düzenleme (PUT /api/products/:id)
- [ ] Ürün silme (DELETE /api/products/:id)
- [ ] Ürün fotoğrafı önizleme
- [ ] Kategori dropdown (dinamik)

#### C. Categories Tab
- [ ] Kategorileri listele
- [ ] Yeni kategori ekle
- [ ] Kategori düzenleme
- [ ] Kategori silme

#### D. Inquiries Tab
- ✅ Inquiry'leri listele
- [ ] Inquiry detayları göster
- [ ] Durum değiştir (pending → responded)

#### E. Quotes Tab
- ✅ Quote'ları listele
- [ ] Quote detayları
- [ ] PDF teklif oluştur

#### F. Customers Tab
- ✅ Müşterileri listele
- [ ] Müşteri detayları
- [ ] Sipariş geçmişi

### 6. Frontend Düzeltmeleri

#### A. Environment Variables
```javascript
// AdminPage.js ve ProductsPage.js'de:
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://ovia-home.com';
```

#### B. Error Handling
```javascript
// API çağrılarında hata yakalama ve kullanıcıya gösterme
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error('API error');
  const data = await response.json();
} catch (error) {
  alert('Bir hata oluştu: ' + error.message);
}
```

#### C. Loading States
```javascript
// Her API çağrısında loading spinner göster
const [loading, setLoading] = useState(false);
```

#### D. Success Feedback
```javascript
// İşlem başarılı olunca toast/alert göster
alert('Ürün başarıyla eklendi!');
```

### 7. Test Senaryoları

#### Local Test
```bash
# 1. Wrangler dev server başlat
npx wrangler pages dev frontend/build --port 8789

# 2. API'leri test et
curl http://localhost:8789/api/products
curl http://localhost:8789/api/sheets?sheet=Products

# 3. Frontend'i tarayıcıda aç
# http://localhost:8789/admin
```

#### Production Test
```bash
# 1. Deploy sonrası API test
curl https://ovia-home.com/api/products
curl https://ovia-home.com/api/sheets?sheet=Products

# 2. Admin panel test
# https://ovia-home.com/admin
# - Login yap
# - Ürün ekle/düzenle/sil dene
# - Kategorileri kontrol et
```

## 🔥 Kritik Noktalar

### Google Sheets API Limitleri
- **Okuma**: 500 requests/100 seconds/user
- **Yazma**: 100 requests/100 seconds/user
- **Çözüm**: Cache kullan (Cloudflare KV veya R2)

### CORS Sorunları
- ✅ _middleware.js zaten CORS ekliyor
- Cloudflare Functions otomatik CORS desteği var

### Authentication
- ⚠️ Admin panel şu anda sadece session-based
- 🔒 İleride JWT veya OAuth eklenebilir

### Rate Limiting
- ⚠️ Şu anda placeholder
- 🔒 Cloudflare Rate Limiting veya custom middleware eklenebilir

## 📝 Örnek Kod Snippets

### Google Sheets'e Yazma
```javascript
// functions/api/products.js - POST method
const appendToSheet = async (values) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Products!A:O:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      values: [values] // [id, category, name_en, ...]
    })
  });
  
  return response.json();
};
```

### Google Sheets'ten Okuma
```javascript
// functions/api/sheets.js - GET method
const response = await fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Products!A2:O1000?key=${API_KEY}`
);
const data = await response.json();
const rows = data.values || [];

// Convert to JSON objects
const products = rows.map(row => ({
  id: row[0],
  category: row[1],
  name: { en: row[2], tr: row[3], de: row[4] },
  // ...
}));
```

## 🎨 Admin Panel Tasarım İyileştirmeleri

### Şu anki sorunlar:
- ❌ Form gönderimi çalışmıyor (backend bağlantısı yok)
- ❌ Ürünler listelenmıyor
- ❌ Silme/düzenleme çalışmıyor
- ❌ Gerçek zamanlı önizleme yok

### Düzeltmeler:
- ✅ API entegrasyonu
- ✅ Loading states
- ✅ Error handling
- ✅ Success feedback
- ✅ Gerçek zamanlı liste güncelleme

## 🚀 Öncelik Sırası

1. **ÖNCELİKLİ**: Cloudflare Environment Variables ekle
2. **ÖNCELİKLİ**: Google API Key oluştur ve ekle
3. Google Sheets yapısını düzenle (kolonlar)
4. sheets.js - Okuma işlemini tamamla
5. products.js - CRUD işlemlerini tamamla
6. Admin panel - Products tab'ı düzelt
7. Test ve debug
8. Diğer tab'ları (categories, inquiries) tamamla

## ⏱️ Tahmini Süre
- Environment Variables setup: 10 dakika
- Google API Key: 5 dakika
- Sheets yapısı: 15 dakika
- Backend API: 2 saat
- Admin panel frontend: 3 saat
- Test ve debug: 1 saat
**Toplam: ~6 saat**

---

**SON NOT**: Bugünlük yaptıklarımız:
- ✅ Cloudflare Functions backend oluşturuldu (8 endpoint)
- ✅ Frontend `.env.local` yapılandırıldı
- ✅ Eksik API endpoint'leri eklendi (quotes, customers, orders)
- ✅ Local test başarılı
- ✅ Production'a deploy edildi

**Yarın devam edilecek**:
1. Environment Variables
2. Google API Key
3. Admin panel düzeltmeleri
