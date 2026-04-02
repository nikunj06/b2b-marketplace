-- ============================================================
-- B2B MARKETPLACE DATABASE SCHEMA
-- Demonstrates: PKs, FKs, Composite PKs, Constraints, 3NF
-- ============================================================

CREATE DATABASE IF NOT EXISTS b2b_marketplace;
USE b2b_marketplace;

-- ============================================================
-- TABLE 1: Users
-- Central authentication table, stores role-based access
-- ============================================================
CREATE TABLE IF NOT EXISTS Users (
    user_id     INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('manufacturer', 'retailer', 'admin') NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: Manufacturers
-- 1:1 with Users; stores business-specific fields
-- Demonstrates: FK, UNIQUE constraint
-- ============================================================
CREATE TABLE IF NOT EXISTS Manufacturers (
    manufacturer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL UNIQUE,
    company_name    VARCHAR(150) NOT NULL,
    gst_number      VARCHAR(20) NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 3: Retailers
-- 1:1 with Users; stores retailer business info
-- ============================================================
CREATE TABLE IF NOT EXISTS Retailers (
    retailer_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL UNIQUE,
    business_name VARCHAR(150) NOT NULL,
    gst_number    VARCHAR(20) NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 4: Products
-- 1:M with Manufacturers (one manufacturer, many products)
-- ============================================================
CREATE TABLE IF NOT EXISTS Products (
    product_id            INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer_id       INT NOT NULL,
    product_name          VARCHAR(200) NOT NULL,
    category              VARCHAR(100) NOT NULL,
    description           TEXT,
    minimum_order_quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (manufacturer_id) REFERENCES Manufacturers(manufacturer_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 5: Inventory
-- Composite PK (product_id, manufacturer_id)
-- CHECK constraint: stock_quantity >= 0
-- Demonstrates 3NF: no transitive dependency
-- ============================================================
CREATE TABLE IF NOT EXISTS Inventory (
    product_id       INT NOT NULL,
    manufacturer_id  INT NOT NULL,
    stock_quantity   INT NOT NULL DEFAULT 0,
    wholesale_price  DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (product_id, manufacturer_id),
    CONSTRAINT chk_stock CHECK (stock_quantity >= 0),
    CONSTRAINT chk_price CHECK (wholesale_price > 0),
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (manufacturer_id) REFERENCES Manufacturers(manufacturer_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 6: Purchase_Orders
-- 1:M with Retailers and Manufacturers
-- ============================================================
CREATE TABLE IF NOT EXISTS Purchase_Orders (
    order_id        INT AUTO_INCREMENT PRIMARY KEY,
    retailer_id     INT NOT NULL,
    manufacturer_id INT NOT NULL,
    order_status    ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
    order_date      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (retailer_id) REFERENCES Retailers(retailer_id) ON DELETE CASCADE,
    FOREIGN KEY (manufacturer_id) REFERENCES Manufacturers(manufacturer_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 7: Order_Items
-- M:M resolution between Orders and Products
-- Stores price_at_purchase for historical accuracy (3NF)
-- ============================================================
CREATE TABLE IF NOT EXISTS Order_Items (
    order_item_id    INT AUTO_INCREMENT PRIMARY KEY,
    order_id         INT NOT NULL,
    product_id       INT NOT NULL,
    quantity         INT NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_quantity CHECK (quantity > 0),
    FOREIGN KEY (order_id) REFERENCES Purchase_Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);
