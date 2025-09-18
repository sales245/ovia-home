# 🏠 Ovia Home - E-Commerce Admin Panel

Modern, kullanıcı dostu ve çok dilli e-ticaret yönetim sistemi. Gelişmiş ürün yönetimi, otomatik çeviri desteği ve gerçek zamanlı önizleme özellikleri ile donatılmıştır.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.0+-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)

## 🌟 Özellikler

### 🛍️ Ürün Yönetimi
- **Akıllı Kategori Sistemi**: Dinamik kategori oluşturma ve yönetimi
- **Çok Dilli Destek**: 12 farklı dilde ürün yönetimi
- **Otomatik Çeviri**: İngilizce girdi ile otomatik çok dilli çeviri
- **Canlı Önizleme**: Gerçek zamanlı ürün kartı önizlemesi
- **URL Entegrasyon**: Diğer sitelerden ürün bilgisi otomatik çekme

### 🎨 Gelişmiş Kullanıcı Arayüzü
- **5 Adımlı Form**: Adım adım rehberli ürün ekleme
- **Görsel Etiketler**: Interaktif ürün özellikleri seçimi
- **Renk Kodlu Bölümler**: Kolay navigasyon için renkli arayüz
- **Responsive Tasarım**: Mobil ve desktop uyumlu

### 🔍 Akıllı Sorgulama
- **Ürün Detay Modal**: "Şimdi Sorgula" özelliği ile detaylı ürün görünümü
- **Kapsamlı Filtreleme**: Kategori, stok durumu ve etiket bazlı filtreleme
- **Gerçek Zamanlı Arama**: Anlık ürün arama ve listeleme

### 💰 Fiyatlandırma Sistemi
- **Çift Fiyat Yapısı**: Perakende ve toptan fiyat desteği
- **Minimum Sipariş**: Toptan satış için minimum adet belirleme
- **Stok Yönetimi**: Anlık stok takibi ve uyarıları

## 🚀 Teknoloji Stack'i

### Frontend
- **React 18** - Modern React hooks ve functional components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Shadcn/ui** - Re-usable component library

### Backend
- **FastAPI** - High-performance Python web framework
- **MongoDB** - NoSQL veritabanı
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation library

### Entegrasyonlar
- **LibreTranslate API** - Ücretsiz çeviri servisi
- **Web Scraping** - Ürün bilgisi otomatik çekme
- **RESTful API** - Modern API tasarımı

## 📁 Proje Yapısı

```
ovia-home/
├── frontend/                 # React uygulaması
│   ├── src/
│   │   ├── components/      # React componentleri
│   │   │   ├── AdminPage.js # Admin panel ana component
│   │   │   ├── ui/          # Shadcn/ui componentleri
│   │   │   └── ...
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/            # Utility fonksiyonları
│   │   └── translations/    # Çok dilli çeviri dosyaları
│   ├── public/             # Static dosyalar
│   └── package.json        # Dependencies
├── backend/                 # FastAPI uygulaması
│   ├── server.py           # Ana server dosyası
│   ├── cart_payment_system.py # Sepet ve ödeme sistemi
│   └── requirements.txt    # Python dependencies
└── tests/                  # Test dosyaları
```

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18.0+
- Python 3.9+
- MongoDB 6.0+

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/sales245/ovia-home.git
cd ovia-home
```

### 2. Backend Kurulumu
```bash
cd backend
pip install -r requirements.txt

# Çevre değişkenlerini ayarlayın
cp .env.example .env
# MongoDB URL'ini ve diğer ayarları .env dosyasında düzenleyin

# Sunucuyu başlatın
python server.py
```

### 3. Frontend Kurulumu
```bash
cd frontend
npm install

# Çevre değişkenlerini ayarlayın
cp .env.example .env.local
# Backend URL'ini ve diğer ayarları düzenleyin

# Uygulamayı başlatın
npm start
```

### 4. MongoDB Kurulumu
```bash
# MongoDB'yi başlatın
mongod

# İlk kategorileri oluşturun (opsiyonel)
curl -X POST http://localhost:8000/api/admin/init-categories
```

## 🎯 Kullanım

### Admin Panel Erişimi
1. **Giriş Bilgileri:**
   - Kullanıcı Adı: `admin`
   - Şifre: `oviahome2024`

2. **Ana URL:** `http://localhost:3000/admin`

### Ürün Ekleme Adımları

#### 1️⃣ Hızlı Entegrasyon (Opsiyonel)
```
🔗 Başka bir siteden ürün linkini yapıştırın
└── Sistem otomatik olarak ürün bilgilerini çeker (fiyat hariç)
```

#### 2️⃣ Temel Bilgiler
```
📋 Kategori seçimi (zorunlu)
📷 Ürün fotoğrafı URL'i
```

#### 3️⃣ Çok Dilli İsimler
```
🌟 İngilizce ürün adı (otomatik çeviri başlatır)
🌍 Diğer diller otomatik doldurulur
```

#### 4️⃣ Ürün Özellikleri
```
✨ 3 ana özellik (İngilizce)
📝 Gelecekte çeviri desteği eklenecek
```

#### 5️⃣ Etiketler ve Sertifikalar
```
🌿 Organik Pamuk
⭐ Premium
✅ Sertifikalı  
♻️ Sürdürülebilir
```

#### 6️⃣ Fiyat ve Stok
```
🛒 Perakende fiyatı
📦 Toptan fiyatı
📊 Minimum toptan miktarı
📈 Stok durumu
```

### Ürün Sorgulama
1. Ürün listesinde herhangi bir ürün fotoğrafının üzerindeki **"🔍 Şimdi Sorgula"** butonuna tıklayın
2. Detaylı ürün bilgileri modal'ında açılır:
   - Çok dilli isimler
   - Tüm özellikler
   - Fiyat bilgileri
   - Stok durumu
   - Etiketler
   - Tarih bilgileri

## 🌍 Desteklenen Diller

| Dil | Kod | Durum |
|-----|-----|-------|
| İngilizce | en | ✅ Ana dil |
| Türkçe | tr | ✅ Otomatik çeviri |
| Almanca | de | ✅ Otomatik çeviri |
| Fransızca | fr | ✅ Otomatik çeviri |
| İtalyanca | it | ✅ Otomatik çeviri |
| İspanyolca | es | ✅ Otomatik çeviri |
| Lehçe | pl | ✅ Otomatik çeviri |
| Rusça | ru | ✅ Otomatik çeviri |
| Bulgarca | bg | ✅ Otomatik çeviri |
| Yunanca | el | ✅ Otomatik çeviri |
| Portekizce | pt | ✅ Otomatik çeviri |
| Arapça | ar | ✅ Otomatik çeviri |

## 🔧 API Endpoints

### Kategoriler
```http
GET    /api/categories          # Tüm kategorileri listele
POST   /api/categories          # Yeni kategori oluştur
PUT    /api/categories/{id}     # Kategori güncelle
DELETE /api/categories/{id}     # Kategori sil
```

### Ürünler
```http
GET    /api/products            # Tüm ürünleri listele
POST   /api/products            # Yeni ürün oluştur
PUT    /api/products/{id}       # Ürün güncelle
DELETE /api/products/{id}       # Ürün sil
```

### Admin
```http
GET    /api/stats               # Dashboard istatistikleri
POST   /api/admin/init-categories # İlk kategorileri oluştur
```

## 🎨 Özelleştirme

### Renk Teması
Tailwind CSS sınıflarını değiştirerek renk temasını özelleştirebilirsiniz:

```javascript
// AdminPage.js içinde
className="bg-blue-50 p-4 rounded-lg border border-blue-200"
```

### Çeviri Servisi
LibreTranslate yerine farklı bir çeviri servisi kullanmak için:

```javascript
// translateText fonksiyonunu değiştirin
const translateText = async (text, targetLang) => {
  // Kendi çeviri API'nizi buraya entegre edin
}
```

## 🔒 Güvenlik

- **Admin Kimlik Doğrulama**: Session-based authentication
- **CORS Koruması**: Cross-origin request güvenliği
- **Input Validation**: Pydantic ile veri doğrulama
- **XSS Koruması**: React'ın built-in XSS koruması

## 🚀 Deploy

### Frontend (Vercel/Netlify)
```bash
npm run build
# Dist klasörünü deploy edin
```

### Backend (Heroku/Railway)
```bash
# Procfile oluşturun
echo "web: python server.py" > Procfile

# Environment variables ayarlayın
# MongoDB URL, API keys vb.
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📈 Gelecek Planları

- [ ] **Gelişmiş Çeviri**: GPT-4 entegrasyonu ile daha kaliteli çeviriler
- [ ] **Görsel AI**: Ürün resmi analizi ve otomatik etiketleme
- [ ] **Bulk Upload**: Excel/CSV ile toplu ürün yükleme
- [ ] **Analytics Dashboard**: Satış analizi ve raporlama
- [ ] **Mobile App**: React Native ile mobil uygulama
- [ ] **Real-time Notifications**: WebSocket ile anlık bildirimler

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **Geliştirici**: sales245
- **Email**: [contact@oviahome.com](mailto:contact@oviahome.com)
- **Website**: [oviahome.com](https://oviahome.com)

---

⭐ **Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!** ⭐
