const db = require('./db');

async function migrate() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Carts (
                cart_id     INT AUTO_INCREMENT PRIMARY KEY,
                retailer_id INT NOT NULL,
                FOREIGN KEY (retailer_id) REFERENCES Retailers(retailer_id) ON DELETE CASCADE,
                UNIQUE KEY unique_retailer_cart (retailer_id)
            )
        `);
        console.log('Carts table created.');

        await db.execute(`
            CREATE TABLE IF NOT EXISTS Cart_Items (
                cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
                cart_id      INT NOT NULL,
                product_id   INT NOT NULL,
                quantity     INT NOT NULL DEFAULT 1,
                FOREIGN KEY (cart_id) REFERENCES Carts(cart_id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
                UNIQUE KEY unique_cart_product (cart_id, product_id)
            )
        `);
        console.log('Cart_Items table created.');
        
    } catch(err) {
        console.error('Migration failed:', err);
    }
    process.exit();
}
migrate();
