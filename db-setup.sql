-- Önce price_tiers sütununu ekleyelim
ALTER TABLE products ADD COLUMN price_tiers TEXT DEFAULT '[]';

-- Örnek bir ürün ekleyelim
INSERT INTO products (
    category,
    name_en,
    name_tr,
    name_de,
    image,
    features_en,
    features_tr,
    badges,
    min_wholesale_quantity,
    stock_quantity,
    in_stock,
    price_tiers
) VALUES (
    'bathrobes',
    'Luxury Hotel Bathrobe',
    'Lüks Otel Bornoz',
    'Luxus Hotel Bademantel',
    'https://example.com/images/bathrobe1.jpg',
    '["100% Turkish Cotton", "600 GSM", "Double Stitched"]',
    '["100% Türk Pamuğu", "600 GSM", "Çift Dikişli"]',
    'premium,organic',
    50,
    1000,
    1,
    '[
        {
            "minQuantity": 1,
            "maxQuantity": 99,
            "price": 24.99
        },
        {
            "minQuantity": 100,
            "maxQuantity": 999,
            "price": 19.99
        },
        {
            "minQuantity": 1000,
            "maxQuantity": 9999,
            "price": 17.99
        },
        {
            "minQuantity": 10000,
            "maxQuantity": null,
            "price": 15.99
        }
    ]'
);