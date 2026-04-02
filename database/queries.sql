-- ============================================================
-- B2B MARKETPLACE - EXAMPLE QUERIES
-- Demonstrates: JOINs, GROUP BY, Aggregates, Subqueries,
--               Sorting, Filtering
-- ============================================================

USE b2b_marketplace;

-- ============================================================
-- QUERY 1 (Basic JOIN): List all products with manufacturer name
-- ============================================================
SELECT
    p.product_id,
    p.product_name,
    p.category,
    p.minimum_order_quantity,
    m.company_name AS manufacturer,
    i.wholesale_price,
    i.stock_quantity
FROM Products p
JOIN Manufacturers m ON m.manufacturer_id = p.manufacturer_id
JOIN Inventory i     ON i.product_id = p.product_id;

-- ============================================================
-- QUERY 2 (Aggregate): Total order value per order
-- ============================================================
SELECT
    po.order_id,
    po.order_status,
    r.business_name AS retailer,
    m.company_name  AS manufacturer,
    SUM(oi.quantity * oi.price_at_purchase) AS total_order_value
FROM Purchase_Orders po
JOIN Retailers r    ON r.retailer_id  = po.retailer_id
JOIN Manufacturers m ON m.manufacturer_id = po.manufacturer_id
JOIN Order_Items oi ON oi.order_id    = po.order_id
GROUP BY po.order_id, po.order_status, r.business_name, m.company_name
ORDER BY total_order_value DESC;

-- ============================================================
-- QUERY 3 (Filtering): Low stock products (stock < 50)
-- ============================================================
SELECT
    p.product_name,
    m.company_name AS manufacturer,
    i.stock_quantity,
    i.wholesale_price
FROM Inventory i
JOIN Products p      ON p.product_id      = i.product_id
JOIN Manufacturers m ON m.manufacturer_id = i.manufacturer_id
WHERE i.stock_quantity < 50
ORDER BY i.stock_quantity ASC;

-- ============================================================
-- QUERY 4 (JOIN + Filter): Full order history for a retailer
-- Replace 1 with the actual retailer_id
-- ============================================================
SELECT
    po.order_id,
    po.order_date,
    po.order_status,
    p.product_name,
    oi.quantity,
    oi.price_at_purchase,
    (oi.quantity * oi.price_at_purchase) AS line_total,
    m.company_name AS manufacturer
FROM Purchase_Orders po
JOIN Order_Items oi  ON oi.order_id       = po.order_id
JOIN Products p      ON p.product_id      = oi.product_id
JOIN Manufacturers m ON m.manufacturer_id = po.manufacturer_id
WHERE po.retailer_id = 1
ORDER BY po.order_date DESC;

-- ============================================================
-- QUERY 5 (GROUP BY + Aggregate): Most ordered products
-- ============================================================
SELECT
    p.product_name,
    p.category,
    SUM(oi.quantity) AS total_quantity_ordered,
    COUNT(DISTINCT oi.order_id) AS number_of_orders
FROM Order_Items oi
JOIN Products p ON p.product_id = oi.product_id
GROUP BY p.product_id, p.product_name, p.category
ORDER BY total_quantity_ordered DESC
LIMIT 10;

-- ============================================================
-- QUERY 6 (GROUP BY): Products grouped by category with count
-- ============================================================
SELECT
    category,
    COUNT(product_id) AS total_products,
    AVG(minimum_order_quantity) AS avg_min_order_qty
FROM Products
GROUP BY category
ORDER BY total_products DESC;

-- ============================================================
-- QUERY 7 (Filter): Orders grouped by status
-- ============================================================
SELECT
    order_status,
    COUNT(*) AS total_orders
FROM Purchase_Orders
GROUP BY order_status;

-- ============================================================
-- QUERY 8 (JOIN + Aggregate): Total sales revenue per manufacturer
-- ============================================================
SELECT
    m.company_name,
    COUNT(DISTINCT po.order_id)             AS total_orders,
    SUM(oi.quantity * oi.price_at_purchase) AS total_revenue
FROM Manufacturers m
JOIN Purchase_Orders po ON po.manufacturer_id = m.manufacturer_id
JOIN Order_Items oi     ON oi.order_id        = po.order_id
WHERE po.order_status IN ('approved','completed')
GROUP BY m.manufacturer_id, m.company_name
ORDER BY total_revenue DESC;

-- ============================================================
-- QUERY 9 (Subquery): Retailers who have placed more than 1 order
-- ============================================================
SELECT
    r.business_name,
    u.email,
    order_count
FROM Retailers r
JOIN Users u ON u.user_id = r.user_id
JOIN (
    SELECT retailer_id, COUNT(*) AS order_count
    FROM Purchase_Orders
    GROUP BY retailer_id
    HAVING COUNT(*) > 1
) AS active_retailers ON active_retailers.retailer_id = r.retailer_id
ORDER BY order_count DESC;

-- ============================================================
-- QUERY 10 (Subquery): Products that have never been ordered
-- ============================================================
SELECT
    p.product_name,
    p.category,
    m.company_name AS manufacturer
FROM Products p
JOIN Manufacturers m ON m.manufacturer_id = p.manufacturer_id
WHERE p.product_id NOT IN (
    SELECT DISTINCT product_id FROM Order_Items
);
