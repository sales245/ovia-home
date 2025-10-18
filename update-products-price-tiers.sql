-- Update products table to include price tiers
ALTER TABLE products ADD COLUMN price_tiers TEXT DEFAULT '[]';

-- Example of how to update existing products with price tiers
UPDATE products SET price_tiers = json_array(
  json_object(
    'minQuantity', 1,
    'maxQuantity', 99,
    'price', ROUND(wholesale_price * 1.2, 2)
  ),
  json_object(
    'minQuantity', 100,
    'maxQuantity', 999,
    'price', wholesale_price
  ),
  json_object(
    'minQuantity', 1000,
    'maxQuantity', 9999,
    'price', ROUND(wholesale_price * 0.95, 2)
  ),
  json_object(
    'minQuantity', 10000,
    'maxQuantity', NULL,
    'price', ROUND(wholesale_price * 0.90, 2)
  )
);