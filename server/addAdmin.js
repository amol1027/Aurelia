const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function addAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'aurelia',
    });

    const email = 'admin@gmail.com';
    const name = 'admin';
    const role = 'admin';
    const password = '123456';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if admin already exists
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
        console.log('Admin user already exists.');
        await connection.end();
        return;
    }

    // Insert admin user
    await connection.query(
        'INSERT INTO users (role, name, email, password, phone, shelter_name, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [role, name, email, hashedPassword, '', '', '']
    );
    console.log('Admin user added successfully.');
    await connection.end();
}

addAdmin().catch(err => {
    console.error('Error adding admin:', err);
});
