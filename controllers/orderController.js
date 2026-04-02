// controllers/orderController.js

const db = require('../db');

// POST /api/orders/place  (retailer places order via stored procedure)
async function placeOrder(req, res) {
    const { manufacturer_id, product_id, quantity } = req.body;
    const retailer_id = req.user.role_id;

    if (!manufacturer_id || !product_id || !quantity) {
        return res.status(400).json({ success: false, message: 'manufacturer_id, product_id and quantity are required.' });
    }

    try {
        // Call stored procedure
        await db.execute(`CALL PlaceOrder(?, ?, ?, ?, @order_id, @message)`,
            [retailer_id, manufacturer_id, product_id, quantity]);

        const [[result]] = await db.execute(`SELECT @order_id AS order_id, @message AS message`);

        if (result.order_id === -1) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(201).json({ success: true, message: result.message, order_id: result.order_id });

    } catch (err) {
        console.error('Place order error:', err);
        return res.status(500).json({ success: false, message: err.sqlMessage || 'Server error.' });
    }
}

// GET /api/orders/retailer/:id
async function getRetailerOrders(req, res) {
    const retailer_id = req.params.id;
    try {
        const [rows] = await db.execute(`
            SELECT po.order_id, po.order_date, po.order_status,
                   m.company_name AS manufacturer,
                   p.product_name, oi.quantity, oi.price_at_purchase,
                   (oi.quantity * oi.price_at_purchase) AS line_total
            FROM Purchase_Orders po
            JOIN Order_Items oi   ON oi.order_id       = po.order_id
            JOIN Products p       ON p.product_id      = oi.product_id
            JOIN Manufacturers m  ON m.manufacturer_id = po.manufacturer_id
            WHERE po.retailer_id = ?
            ORDER BY po.order_date DESC
        `, [retailer_id]);
        return res.json({ success: true, orders: rows });
    } catch (err) {
        console.error('Get retailer orders error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
}

// GET /api/orders/manufacturer/:id
async function getManufacturerOrders(req, res) {
    const manufacturer_id = req.params.id;
    try {
        const [rows] = await db.execute(`
            SELECT po.order_id, po.order_date, po.order_status,
                   r.business_name AS retailer,
                   p.product_name, oi.quantity, oi.price_at_purchase,
                   (oi.quantity * oi.price_at_purchase) AS line_total
            FROM Purchase_Orders po
            JOIN Order_Items oi  ON oi.order_id       = po.order_id
            JOIN Products p      ON p.product_id      = oi.product_id
            JOIN Retailers r     ON r.retailer_id     = po.retailer_id
            WHERE po.manufacturer_id = ?
            ORDER BY po.order_date DESC
        `, [manufacturer_id]);
        return res.json({ success: true, orders: rows });
    } catch (err) {
        console.error('Get manufacturer orders error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
}

// PUT /api/orders/status  (manufacturer updates order status)
async function updateOrderStatus(req, res) {
    const { order_id, status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];

    if (!order_id || !status || !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Valid order_id and status are required.' });
    }

    try {
        await db.execute(`CALL UpdateOrderStatus(?, ?, @message)`, [order_id, status]);
        const [[result]] = await db.execute(`SELECT @message AS message`);
        return res.json({ success: true, message: result.message });
    } catch (err) {
        console.error('Update status error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
}

module.exports = { placeOrder, getRetailerOrders, getManufacturerOrders, updateOrderStatus };
