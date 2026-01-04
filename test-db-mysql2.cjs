require('dotenv').config();
const mysql = require('mysql2');

// Force IPv4 loopback
const config = {
    host: '127.0.0.1',
    user: process.env.MYSQL_ADDON_USER || process.env.DB_USER || 'root',
    database: process.env.MYSQL_ADDON_DB || process.env.DB_NAME || 'hms',
    password: process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD,
    port: 3306,
    connectTimeout: 3000
};

console.log("Testing mysql2 Connection...");

const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.error("❌ mysql2 Connection Failed:", err.message);
    } else {
        console.log("✅ mysql2 Connection Successful!");
        connection.end();
    }
});
