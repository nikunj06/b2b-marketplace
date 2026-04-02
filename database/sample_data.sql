-- ============================================================
-- B2B MARKETPLACE - SAMPLE DATA
-- Passwords are bcrypt hashes of 'password123'
-- ============================================================

USE b2b_marketplace;

-- Clear existing data (safe for dev/testing)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Order_Items;
TRUNCATE TABLE Purchase_Orders;
TRUNCATE TABLE Inventory;
TRUNCATE TABLE Products;
TRUNCATE TABLE Retailers;
TRUNCATE TABLE Manufacturers;
TRUNCATE TABLE Users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USERS (bcrypt hash of "password123")
-- ============================================================
INSERT INTO Users (name, email, password, role) VALUES
('Admin User',      'admin@b2b.com',        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin'),
('Ravi Sharma',     'ravi@texcorp.com',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'manufacturer'),
('Priya Electronics','priya@priyaelec.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'manufacturer'),
('Ankit Retail',    'ankit@ankitmart.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'retailer'),
('Meena Stores',    'meena@meenastores.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'retailer'),
('Suresh Traders',  'suresh@sureshtr.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'retailer');

-- ============================================================
-- MANUFACTURERS
-- ============================================================
INSERT INTO Manufacturers (user_id, company_name, gst_number) VALUES
(2, 'TexCorp Fabrics Ltd',       'GST27AABCT1234A1Z5'),
(3, 'Priya Electronics Pvt Ltd', 'GST29AAECP5678B2Z6');

-- ============================================================
-- RETAILERS
-- ============================================================
INSERT INTO Retailers (user_id, business_name, gst_number) VALUES
(4, 'Ankit General Mart',   'GST07AACCA9012C3Z7'),
(5, 'Meena Wholesale Store', 'GST19AACCM3456D4Z8'),
(6, 'Suresh Trading Co.',    'GST24AACCS7890E5Z9');

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT INTO Products (manufacturer_id, product_name, category, description, minimum_order_quantity) VALUES
-- TexCorp (manufacturer_id = 1)
(1, 'Cotton Plain Fabric',     'Textiles',    '100% pure cotton, 44 inch width',           50),
(1, 'Polyester Blended Fabric','Textiles',    'Polyester-cotton blend, wrinkle resistant',  100),
(1, 'Silk Saree Fabric',       'Textiles',    'Premium silk weave for sarees',              20),
-- Priya Electronics (manufacturer_id = 2)
(2, 'LED Bulb 9W',             'Electronics', 'Energy saving LED, warm white, B22 cap',    100),
(2, 'USB-C Cable 1m',          'Electronics', 'Fast charging USB-C to USB-A, 3A',          200),
(2, 'Electric Extension Board','Electronics', '4-socket surge protected extension board',   50);

-- ============================================================
-- INVENTORY
-- ============================================================
INSERT INTO Inventory (product_id, manufacturer_id, stock_quantity, wholesale_price) VALUES
(1, 1, 500,  85.00),   -- Cotton Fabric: 500 units @ ₹85
(2, 1, 800,  60.00),   -- Polyester Fabric: 800 @ ₹60
(3, 1, 200, 350.00),   -- Silk Fabric: 200 @ ₹350
(4, 2, 1000,  35.00),  -- LED Bulb: 1000 @ ₹35
(5, 2, 2000,  55.00),  -- USB-C Cable: 2000 @ ₹55
(6, 2,  600,  180.00); -- Extension Board: 600 @ ₹180

-- ============================================================
-- PURCHASE ORDERS & ORDER ITEMS (sample completed orders)
-- ============================================================
INSERT INTO Purchase_Orders (retailer_id, manufacturer_id, order_status, order_date) VALUES
(1, 1, 'completed',  '2025-01-10 09:00:00'),
(2, 2, 'approved',   '2025-01-12 11:00:00'),
(3, 1, 'pending',    '2025-01-15 14:00:00'),
(1, 2, 'completed',  '2025-01-18 10:00:00'),
(2, 1, 'rejected',   '2025-01-20 16:00:00');

INSERT INTO Order_Items (order_id, product_id, quantity, price_at_purchase) VALUES
(1, 1, 100, 85.00),
(1, 2, 200, 60.00),
(2, 4, 500, 35.00),
(2, 5, 300, 55.00),
(3, 3,  20, 350.00),
(4, 4, 200, 35.00),
(4, 6, 100, 180.00),
(5, 1,  50, 85.00);
