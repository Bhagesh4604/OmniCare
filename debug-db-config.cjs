require('dotenv').config();
const mysql = require('mysql2');

const dbHost = process.env.MYSQL_ADDON_HOST || process.env.DB_HOST;
const finalHost = dbHost === 'localhost' ? '127.0.0.1' : dbHost;
const sslConfig = (process.env.DB_SSL === 'true' || (dbHost && dbHost.includes('azure.com'))) ? { rejectUnauthorized: false } : undefined;

console.log("--- EFFECTIVE CONFIG ---");
console.log("Raw Host:", dbHost);
console.log("Final Host:", finalHost);
console.log("User:", process.env.MYSQL_ADDON_USER || process.env.DB_USER);
console.log("Database:", process.env.MYSQL_ADDON_DB || process.env.DB_NAME);
console.log("SSL Enabled:", !!sslConfig);
console.log("------------------------");

const connection = mysql.createConnection({
    host: finalHost,
    user: process.env.MYSQL_ADDON_USER || process.env.DB_USER,
    password: process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQL_ADDON_DB || process.env.DB_NAME,
    timezone: '+00:00',
    connectTimeout: 20000, // 20 seconds
    ssl: sslConfig
});

console.log("Attempting Connection (20s timeout)...");
const start = Date.now();

connection.connect((err) => {
    const duration = Date.now() - start;
    console.log(`Connection attempt took ${duration}ms`);
    if (err) {
        console.error("❌ Connection Failed:", err.message);
        console.error("Code:", err.code);
    } else {
        console.log("✅ Connection Successful!");
        connection.end();
    }
});
