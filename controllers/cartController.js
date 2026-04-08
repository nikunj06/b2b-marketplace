const db = require('../db');

// Helper to get or create cart
async function getOrCreateCart(retailer_id) {
    let [carts] = await db.execute('SELECT cart_id FROM Carts WHERE retailer_id = ?', [retailer_id]);
    if (carts.length === 0) {
        const [result] = await db.execute('INSERT INTO Carts (retailer_id) VALUES (?)', [retailer_id]);
        return result.insertId;
    }
    return carts[0].cart_id;
}

exports.getCart = async (req, res, next) => {
    try {
        const cart_id = await getOrCreateCart(req.user.role_id);
        const [items] = await db.execute(`
            SELECT ci.cart_item_id, ci.product_id, ci.quantity, 
                   p.product_name, p.image_url, p.minimum_order_quantity, p.manufacturer_id,
                   i.wholesale_price, i.stock_quantity,
                   m.company_name AS manufacturer
            FROM Cart_Items ci
            JOIN Products p ON p.product_id = ci.product_id
            JOIN Inventory i ON i.product_id = p.product_id
            JOIN Manufacturers m ON m.manufacturer_id = p.manufacturer_id
            WHERE ci.cart_id = ?
        `, [cart_id]);

        return res.json({ success: true, items });
    } catch (err) { next(err); }
};

exports.addToCart = async (req, res, next) => {
    const { product_id, quantity } = req.body;
    try {
        const cart_id = await getOrCreateCart(req.user.role_id);
        
        // Validation: MOQ and Stock
        const [prods] = await db.execute('SELECT minimum_order_quantity FROM Products WHERE product_id = ?', [product_id]);
        const [invs] = await db.execute('SELECT stock_quantity FROM Inventory WHERE product_id = ?', [product_id]);
        
        if (prods.length === 0 || invs.length === 0) return res.status(404).json({ success: false, message: 'Product not found.' });
        
        const moq = prods[0].minimum_order_quantity;
        const stock = invs[0].stock_quantity;

        // Check if item exists in cart already
        const [existing] = await db.execute('SELECT cart_item_id, quantity FROM Cart_Items WHERE cart_id = ? AND product_id = ?', [cart_id, product_id]);
        let newQty = quantity;
        
        if (existing.length > 0) {
            newQty += existing[0].quantity;
        }

        if (newQty < moq) return res.status(400).json({ success: false, message: `Minimum order quantity is ${moq}.` });
        if (newQty > stock) return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${stock}` });

        if (existing.length > 0) {
            await db.execute('UPDATE Cart_Items SET quantity = ? WHERE cart_item_id = ?', [newQty, existing[0].cart_item_id]);
        } else {
            await db.execute('INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cart_id, product_id, newQty]);
        }
        
        return res.json({ success: true, message: 'Product added to cart.' });
    } catch (err) { next(err); }
};

exports.updateCartItem = async (req, res, next) => {
    const { cart_item_id, quantity } = req.body;
    try {
        const [item] = await db.execute(`
            SELECT ci.product_id, p.minimum_order_quantity, i.stock_quantity
            FROM Cart_Items ci
            JOIN Products p ON p.product_id = ci.product_id
            JOIN Inventory i ON i.product_id = p.product_id
            WHERE ci.cart_item_id = ?
        `, [cart_item_id]);

        if (item.length === 0) return res.status(404).json({ success: false, message: 'Cart item not found.' });
        
        if (quantity < item[0].minimum_order_quantity) return res.status(400).json({ success: false, message: `Minimum quantity is ${item[0].minimum_order_quantity}` });
        if (quantity > item[0].stock_quantity) return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${item[0].stock_quantity}` });

        await db.execute('UPDATE Cart_Items SET quantity = ? WHERE cart_item_id = ?', [quantity, cart_item_id]);
        return res.json({ success: true, message: 'Cart updated.' });
    } catch (err) { next(err); }
};

exports.removeFromCart = async (req, res, next) => {
    try {
        await db.execute('DELETE FROM Cart_Items WHERE cart_item_id = ?', [req.params.id]);
        return res.json({ success: true, message: 'Item removed from cart.' });
    } catch (err) { next(err); }
};

exports.clearCart = async (req, res, next) => {
    try {
        const cart_id = await getOrCreateCart(req.user.role_id);
        await db.execute('DELETE FROM Cart_Items WHERE cart_id = ?', [cart_id]);
        return res.json({ success: true, message: 'Cart cleared.' });
    } catch (err) { next(err); }
};
