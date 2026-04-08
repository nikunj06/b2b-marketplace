const db = require('./db');
const bcrypt = require('bcrypt');

async function test() {
    try {
        const [rows] = await db.execute('SELECT email, password FROM Users');
        for (let row of rows) {
            const match = await bcrypt.compare('password123', row.password);
            console.log(`Email: ${row.email}, Match: ${match}, Hash: ${row.password}`);
        }
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
test();
