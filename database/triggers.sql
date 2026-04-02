-- ============================================================
-- B2B MARKETPLACE TRIGGERS
-- ============================================================

USE b2b_marketplace;

-- Drop triggers if they already exist (for re-runs)
DROP TRIGGER IF EXISTS prevent_negative_stock;
DROP TRIGGER IF EXISTS log_order_status_change;
DROP TRIGGER IF EXISTS prevent_order_item_without_stock;

DELIMITER $$

-- ============================================================
-- TRIGGER 1: Prevent Negative Stock on UPDATE
-- Fires BEFORE UPDATE on Inventory
-- Raises error if stock goes below 0
-- ============================================================
CREATE TRIGGER prevent_negative_stock
BEFORE UPDATE ON Inventory
FOR EACH ROW
BEGIN
    IF NEW.stock_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: Stock quantity cannot be negative.';
    END IF;
END$$

-- ============================================================
-- TRIGGER 2: Log Order Status Changes
-- Fires AFTER UPDATE on Purchase_Orders
-- Keeps an audit trail of status changes
-- ============================================================

CREATE TABLE IF NOT EXISTS Order_Status_Log (
    log_id      INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT NOT NULL,
    old_status  VARCHAR(20),
    new_status  VARCHAR(20),
    changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER log_order_status_change
AFTER UPDATE ON Purchase_Orders
FOR EACH ROW
BEGIN
    IF OLD.order_status <> NEW.order_status THEN
        INSERT INTO Order_Status_Log (order_id, old_status, new_status)
        VALUES (OLD.order_id, OLD.order_status, NEW.order_status);
    END IF;
END$$

-- ============================================================
-- TRIGGER 3: Prevent Order Item Insertion if Stock < MOQ
-- Fires BEFORE INSERT on Order_Items
-- Validates that quantity meets minimum order quantity
-- ============================================================
CREATE TRIGGER prevent_order_item_without_stock
BEFORE INSERT ON Order_Items
FOR EACH ROW
BEGIN
    DECLARE available_stock INT;
    DECLARE min_qty INT;

    SELECT i.stock_quantity INTO available_stock
    FROM Inventory i
    JOIN Products p ON p.product_id = i.product_id
    WHERE i.product_id = NEW.product_id
    LIMIT 1;

    SELECT minimum_order_quantity INTO min_qty
    FROM Products
    WHERE product_id = NEW.product_id;

    IF available_stock IS NULL OR available_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: Insufficient stock for this order item.';
    END IF;

    IF NEW.quantity < min_qty THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ERROR: Quantity is below minimum order quantity.';
    END IF;
END$$

DELIMITER ;
