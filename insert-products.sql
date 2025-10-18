-- Insert sample products with price tiers
INSERT INTO products (category, name_en, name_tr, features_en, features_tr, badges, price_tiers, min_wholesale_quantity, stock_quantity) VALUES 
('bathrobes', 'Premium Cotton Bathrobe', 'Premium Pamuklu Bornoz', 
'["100% Turkish Cotton", "Ultra Soft", "Quick Dry"]', 
'["100% Türk Pamuğu", "Ekstra Yumuşak", "Hızlı Kuruyan"]', 
'premium,organic', 
'[{"quantity": 1, "price": 99.99}, {"quantity": 10, "price": 89.99}, {"quantity": 50, "price": 79.99}, {"quantity": 100, "price": 69.99}]',
10, 
150),

('towels', 'Turkish Towel Set', 'Türk Havlu Seti', 
'["600 GSM", "Highly Absorbent", "Durable"]', 
'["600 GSM", "Yüksek Emici", "Dayanıklı"]', 
'bestseller', 
'[{"quantity": 1, "price": 49.99}, {"quantity": 50, "price": 44.99}, {"quantity": 100, "price": 39.99}, {"quantity": 500, "price": 34.99}]',
50, 
300);