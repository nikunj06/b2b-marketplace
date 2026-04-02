-- ============================================================
-- B2B MARKETPLACE STORED PROCEDURES
-- ============================================================

USE b2b_marketplace;

DROP PROCEDURE IF EXISTS PlaceOrder;
DROP PROCEDURE IF EXISTS UpdateOrderStatus;
DROP PROCEDURE IF EXISTS GetManufacturerSalesReport;

DELIMITER $$

-- ============================================================
-- PROCEDURE 1: PlaceOrder
-- Uses a TRANSACTION to atomically:
--   1. Validate minimum order quantities
--   2. Validate stock availability
--   3. Create the Purchase_Order record
--   4. Insert Order_Items
--   5. Deduct stock from Inventory
--   6. ROLLBACK if anything fails
-- ============================================================
CREATE PROCEDURE PlaceOrder(
    IN  p_retailer_id      INT,
    IN  p_manufacturer_id  INT,
    IN  p_product_id       INT,
    IN  p_quantity         INT,
    OUT p_order_id         INT,
    OUT p_message          VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_stock        INT DEFAULT 0;
    DECLARE v_min_qty      INT DEFAULT 1;
    DECLARE v_price        DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_new_order_id INT DEFAULT 0;
    DECLARE exit handler FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_order_id = -1;
        SET p_message  = 'Transaction failed and was rolled back.';
    END;

    -- Step 1: Fetch stock and minimum order quantity
    SELECT i.stock_quantity, i.wholesale_price, p.minimum_order_quantity
    INTO   v_stock, v_price, v_min_qty
    FROM   Inventory i
    JOIN   Products p ON p.product_id = i.product_id
    WHERE  i.product_id      = p_product_id
      AND  i.manufacturer_id = p_manufacturer_id;

    -- Step 2: Validate minimum order quantity
    IF p_quantity < v_min_qty THEN
        SET p_order_id = -1;
        SET p_message  = CONCAT('Quantity below minimum order quantity of ', v_min_qty);
        LEAVE proc_label;
    END IF;

    -- Step 3: Validate stock
    IF p_quantity > v_stock THEN
        SET p_order_id = -1;
        SET p_message  = CONCAT('Insufficient stock. Available: ', v_stock);
        LEAVE proc_label;
    END IF;

    -- Step 4: Begin transaction
    START TRANSACTION;

    -- Step 5: Create the order
    INSERT INTO Purchase_Orders (retailer_id, manufacturer_id, order_status)
    VALUES (p_retailer_id, p_manufacturer_id, 'pending');

    SET v_new_order_id = LAST_INSERT_ID();

    -- Step 6: Insert order item
    INSERT INTO Order_Items (order_id, product_id, quantity, price_at_purchase)
    VALUES (v_new_order_id, p_product_id, p_quantity, v_price);

    -- Step 7: Deduct from inventory
    UPDATE Inventory
    SET    stock_quantity = stock_quantity - p_quantity
    WHERE  product_id      = p_product_id
      AND  manufacturer_id = p_manufacturer_id;

    -- Step 8: Commit
    COMMIT;

    SET p_order_id = v_new_order_id;
    SET p_message  = 'Order placed successfully.';

END$$

-- ============================================================
-- PROCEDURE 2: UpdateOrderStatus
-- Allows manufacturer/admin to change order status
-- ============================================================
CREATE PROCEDURE UpdateOrderStatus(
    IN  p_order_id  INT,
    IN  p_new_status VARCHAR(20),
    OUT p_message   VARCHAR(255)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;

    SELECT COUNT(*) INTO v_count FROM Purchase_Orders WHERE order_id = p_order_id;

    IF v_count = 0 THEN
        SET p_message = 'Order not found.';
    ELSE
        UPDATE Purchase_Orders
        SET    order_status = p_new_status
        WHERE  order_id = p_order_id;
        SET p_message = CONCAT('Order ', p_order_id, ' status updated to ', p_new_status);
    END IF;
END$$

-- ============================================================
-- PROCEDURE 3: GetManufacturerSalesReport
-- Returns total quantity sold and revenue per product
-- ============================================================
CREATE PROCEDURE GetManufacturerSalesReport(
    IN p_manufacturer_id INT
)
BEGIN
    SELECT
        p.product_name,
        p.category,
        SUM(oi.quantity)                         AS total_units_sold,
        SUM(oi.quantity * oi.price_at_purchase)  AS total_revenue
    FROM   Order_Items oi
    JOIN   Products p ON p.product_id = oi.product_id
    JOIN   Purchase_Orders po ON po.order_id = oi.order_id
    WHERE  po.manufacturer_id = p_manufacturer_id
      AND  po.order_status    IN ('approved', 'completed')
    GROUP BY p.product_id, p.product_name, p.category
    ORDER BY total_revenue DESC;
END$$

DELIMITER ;
