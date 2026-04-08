// controllers/adminController.js

const db = require('../db');

// GET /api/admin/users
async function getAllUsers(req, res, next) {
    try {
        const [rows] = await db.execute(`
            SELECT u.user_id, u.name, u.email, u.role, u.created_at,
                   COALESCE(m.company_name, r.business_name, 'N/A') AS business,
                   COALESCE(m.gst_number, r.gst_number, 'N/A') AS gst
            FROM Users u
            LEFT JOIN Manufacturers m ON m.user_id = u.user_id
            LEFT JOIN Retailers r     ON r.user_id = u.user_id
            ORDER BY u.created_at DESC
        `);
        return res.json({ success: true, users: rows });
    } catch (err) {
        next(err);
    }
}

// GET /api/admin/orders
async function getAllOrders(req, res, next) {
    try {
        const [rows] = await db.execute(`
            SELECT po.order_id, po.order_date, po.order_status,
                   r.business_name AS retailer, m.company_name AS manufacturer,
                   COUNT(oi.order_item_id) AS item_count,
                   SUM(oi.quantity * oi.price_at_purchase) AS total_value
            FROM Purchase_Orders po
            JOIN Retailers r     ON r.retailer_id     = po.retailer_id
            JOIN Manufacturers m ON m.manufacturer_id = po.manufacturer_id
            JOIN Order_Items oi  ON oi.order_id       = po.order_id
            GROUP BY po.order_id, po.order_date, po.order_status,
                     r.business_name, m.company_name
            ORDER BY po.order_date DESC
        `);
        return res.json({ success: true, orders: rows });
    } catch (err) {
        next(err);
    }
}

// GET /api/admin/inventory
async function getAllInventory(req, res, next) {
    try {
        const [rows] = await db.execute(`
            SELECT p.product_id, p.product_name, p.category,
                   p.minimum_order_quantity, m.company_name AS manufacturer,
                   i.stock_quantity, i.wholesale_price
            FROM Inventory i
            JOIN Products p      ON p.product_id      = i.product_id
            JOIN Manufacturers m ON m.manufacturer_id = i.manufacturer_id
            ORDER BY i.stock_quantity ASC
        `);
        return res.json({ success: true, inventory: rows });
    } catch (err) {
        next(err);
    }
}

// GET /api/admin/stats  (dashboard summary)
async function getDashboardStats(req, res, next) {
    try {
        const [[usersCount]]     = await db.execute('SELECT COUNT(*) AS total FROM Users WHERE role != "admin"');
        const [[ordersCount]]    = await db.execute('SELECT COUNT(*) AS total FROM Purchase_Orders');
        const [[productsCount]]  = await db.execute('SELECT COUNT(*) AS total FROM Products');
        const [[revenueResult]]  = await db.execute(`
            SELECT COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS total
            FROM Order_Items oi
            JOIN Purchase_Orders po ON po.order_id = oi.order_id
            WHERE po.order_status IN ('approved','completed')
        `);

        return res.json({
            success: true,
            stats: {
                total_users:    usersCount.total,
                total_orders:   ordersCount.total,
                total_products: productsCount.total,
                total_revenue:  revenueResult.total
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getAllUsers, getAllOrders, getAllInventory, getDashboardStats };
