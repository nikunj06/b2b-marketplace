// controllers/orderController.js

const db = require('../db');

// POST /api/orders/place  (retailer places order via stored procedure)
async function placeOrder(req, res, next) {
    const { manufacturer_id, product_id, quantity } = req.body;
    const retailer_id = req.user.role_id;

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
        next(err);
    }
}

// POST /api/orders/checkout (retailer checks out their cart)
async function checkoutCart(req, res, next) {
    const retailer_id = req.user.role_id;
    let connection;
    try {
        const [carts] = await db.execute('SELECT cart_id FROM Carts WHERE retailer_id = ?', [retailer_id]);
        if (carts.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty.' });
        const cart_id = carts[0].cart_id;

        const [items] = await db.execute(`
            SELECT ci.cart_item_id, ci.product_id, ci.quantity, 
                   p.manufacturer_id, p.minimum_order_quantity, 
                   i.wholesale_price, i.stock_quantity
            FROM Cart_Items ci
            JOIN Products p ON p.product_id = ci.product_id
            JOIN Inventory i ON i.product_id = p.product_id
            WHERE ci.cart_id = ?
        `, [cart_id]);

        if (items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty.' });

        for (const item of items) {
            if (item.quantity < item.minimum_order_quantity) {
                return res.status(400).json({ success: false, message: `MOQ not met for product ${item.product_id}` });
            }
            if (item.quantity > item.stock_quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for product ${item.product_id}` });
            }
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const ordersByMfg = {};
        for (const item of items) {
            if (!ordersByMfg[item.manufacturer_id]) ordersByMfg[item.manufacturer_id] = [];
            ordersByMfg[item.manufacturer_id].push(item);
        }

        for (const mfg_id in ordersByMfg) {
            const [orderRes] = await connection.execute(
                "INSERT INTO Purchase_Orders (retailer_id, manufacturer_id, order_status) VALUES (?, ?, 'pending')",
                [retailer_id, mfg_id]
            );
            const order_id = orderRes.insertId;

            for (const item of ordersByMfg[mfg_id]) {
                await connection.execute(
                    'INSERT INTO Order_Items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                    [order_id, item.product_id, item.quantity, item.wholesale_price]
                );
            }
        }

        await connection.execute('DELETE FROM Cart_Items WHERE cart_id = ?', [cart_id]);
        await connection.commit();
        res.json({ success: true, message: 'Order(s) placed successfully.' });

    } catch (err) {
        if (connection) await connection.rollback();
        next(err);
    } finally {
        if (connection) connection.release();
    }
}

// GET /api/orders/retailer/:id
async function getRetailerOrders(req, res, next) {
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
        next(err);
    }
}

// GET /api/orders/manufacturer/:id
async function getManufacturerOrders(req, res, next) {
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
        next(err);
    }
}

// PUT /api/orders/status  (manufacturer updates order status)
async function updateOrderStatus(req, res, next) {
    const { order_id, status } = req.body;

    try {
        await db.execute(`CALL UpdateOrderStatus(?, ?, @message)`, [order_id, status]);
        const [[result]] = await db.execute(`SELECT @message AS message`);
        return res.json({ success: true, message: result.message });
    } catch (err) {
        next(err);
    }
}

module.exports = { placeOrder, checkoutCart, getRetailerOrders, getManufacturerOrders, updateOrderStatus };
