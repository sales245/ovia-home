-- Insert Categories
INSERT INTO categories (name_en, name_tr, name_de, slug, description_en, description_tr, sort_order, is_active) VALUES
('Bathrobes', 'Bornozlar', 'Bademäntel', 'bathrobes', 'Luxurious and comfortable bathrobes', 'Lüks ve rahat bornozlar', 1, 1),
('Towels', 'Havlular', 'Handtücher', 'towels', 'Premium quality towels for every need', 'Her ihtiyaç için premium kalite havlular', 2, 1),
('Bedding', 'Yatak Takımları', 'Bettwäsche', 'bedding', 'Comfortable and elegant bedding sets', 'Rahat ve şık yatak takımları', 3, 1),
('Home Decor', 'Ev Dekorasyonu', 'Heimdekoration', 'home-decor', 'Beautiful home decoration items', 'Güzel ev dekorasyon ürünleri', 4, 1);

-- Insert Sample Products
INSERT INTO products (
  category, name_en, name_tr, name_de, image, features_en, features_tr, badges, 
  retail_price, min_wholesale_quantity, stock_quantity, in_stock, price_tiers
) VALUES
(
  'bathrobes',
  'Premium Cotton Bathrobe',
  'Premium Pamuklu Bornoz',
  'Premium Baumwoll-Bademantel',
  'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800',
  '["100% Turkish Cotton", "Ultra Soft & Absorbent", "Machine Washable"]',
  '["100% Türk Pamuğu", "Ultra Yumuşak ve Emici", "Makinede Yıkanabilir"]',
  'organicCotton,premium',
  45.99,
  50,
  500,
  1,
  '[{"quantity":50,"price":35.99},{"quantity":100,"price":32.99},{"quantity":500,"price":28.99}]'
),
(
  'towels',
  'Luxury Hotel Towel Set',
  'Lüks Otel Havlu Seti',
  'Luxus Hotel Handtuch-Set',
  'https://images.unsplash.com/photo-1616694093781-c992dddb3ed5?w=800',
  '["600 GSM Premium Cotton", "Quick Dry Technology", "Set of 6 Pieces"]',
  '["600 GSM Premium Pamuk", "Hızlı Kuruma Teknolojisi", "6 Parça Set"]',
  'premium,certified',
  29.99,
  100,
  800,
  1,
  '[{"quantity":100,"price":22.99},{"quantity":200,"price":19.99},{"quantity":500,"price":16.99}]'
),
(
  'bedding',
  'Egyptian Cotton Bed Sheet Set',
  'Mısır Pamuğu Çarşaf Seti',
  'Ägyptische Baumwolle Bettlaken-Set',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  '["800 Thread Count", "100% Egyptian Cotton", "Wrinkle Resistant"]',
  '["800 İplik Sayısı", "100% Mısır Pamuğu", "Kırışmaya Dayanıklı"]',
  'premium,sustainable',
  89.99,
  30,
  300,
  1,
  '[{"quantity":30,"price":75.99},{"quantity":50,"price":69.99},{"quantity":100,"price":62.99}]'
),
(
  'towels',
  'Bamboo Bath Towel',
  'Bambu Banyo Havlusu',
  'Bambus Badetuch',
  'https://images.unsplash.com/photo-1602269430032-6e48ce828eb2?w=800',
  '["Eco-Friendly Bamboo", "Antibacterial Properties", "Extra Soft"]',
  '["Çevre Dostu Bambu", "Antibakteriyel Özellikler", "Ekstra Yumuşak"]',
  'sustainable,organicCotton',
  24.99,
  100,
  600,
  1,
  '[{"quantity":100,"price":18.99},{"quantity":250,"price":16.99},{"quantity":500,"price":14.99}]'
),
(
  'home-decor',
  'Decorative Pillow Set',
  'Dekoratif Yastık Seti',
  'Dekoratives Kissen-Set',
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
  '["Premium Fabric", "Hand-Crafted Design", "Set of 4"]',
  '["Premium Kumaş", "El Yapımı Tasarım", "4 Parça Set"]',
  'premium',
  39.99,
  50,
  400,
  1,
  '[{"quantity":50,"price":32.99},{"quantity":100,"price":29.99},{"quantity":200,"price":26.99}]'
);
