// controllers/productController.js

const db = require('../db');

// POST /api/products/add  (manufacturer only)
async function addProduct(req, res, next) {
    const { product_name, category, description, minimum_order_quantity, stock_quantity, wholesale_price } = req.body;
    const manufacturer_id = req.user.role_id;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // Insert product
        const [prodResult] = await db.execute(
            'INSERT INTO Products (manufacturer_id, product_name, category, description, image_url, minimum_order_quantity) VALUES (?, ?, ?, ?, ?, ?)',
            [manufacturer_id, product_name, category, description || '', image_url, minimum_order_quantity]
        );
        const product_id = prodResult.insertId;

        // Insert inventory (composite PK)
        await db.execute(
            'INSERT INTO Inventory (product_id, manufacturer_id, stock_quantity, wholesale_price) VALUES (?, ?, ?, ?)',
            [product_id, manufacturer_id, stock_quantity, wholesale_price]
        );

        return res.status(201).json({ success: true, message: 'Product added successfully.', product_id });

    } catch (err) {
        next(err);
    }
}

// GET /api/products/all  (retailers browse all products)
async function getAllProducts(req, res, next) {
    try {
        const [rows] = await db.execute(`
            SELECT p.product_id, p.product_name, p.category, p.description, p.image_url,
                   p.minimum_order_quantity, p.manufacturer_id,
                   m.company_name AS manufacturer,
                   i.stock_quantity, i.wholesale_price
            FROM Products p
            JOIN Manufacturers m ON m.manufacturer_id = p.manufacturer_id
            JOIN Inventory i     ON i.product_id = p.product_id
            ORDER BY p.category, p.product_name
        `);
        return res.json({ success: true, products: rows });
    } catch (err) {
        next(err);
    }
}

// GET /api/products/manufacturer/:id  (manufacturer's own products)
async function getManufacturerProducts(req, res, next) {
    const manufacturer_id = req.params.id;
    try {
        const [rows] = await db.execute(`
            SELECT p.product_id, p.product_name, p.category, p.description, p.image_url,
                   p.minimum_order_quantity, i.stock_quantity, i.wholesale_price
            FROM Products p
            JOIN Inventory i ON i.product_id = p.product_id
            WHERE p.manufacturer_id = ?
            ORDER BY p.category, p.product_name
        `, [manufacturer_id]);
        return res.json({ success: true, products: rows });
    } catch (err) {
        next(err);
    }
}

// PUT /api/inventory/update  (manufacturer updates stock/price)
async function updateInventory(req, res, next) {
    const { product_id, stock_quantity, wholesale_price } = req.body;
    const manufacturer_id = req.user.role_id;

    try {
        await db.execute(
            `UPDATE Inventory SET stock_quantity = ?, wholesale_price = ?
             WHERE product_id = ? AND manufacturer_id = ?`,
            [stock_quantity, wholesale_price, product_id, manufacturer_id]
        );
        return res.json({ success: true, message: 'Inventory updated.' });
    } catch (err) {
        next(err);
    }
}

module.exports = { addProduct, getAllProducts, getManufacturerProducts, updateInventory };
