const db = require('./db');
const bcrypt = require('bcrypt');

async function fix() {
    try {
        const hash = await bcrypt.hash('password123', 10);
        await db.execute('UPDATE Users SET password = ?', [hash]);
        console.log('Successfully updated all users to password123');
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
fix();
