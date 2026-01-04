require('dotenv').config();
const mysql = require('mysql');

const config = {
    host: process.env.MYSQL_ADDON_HOST || process.env.DB_HOST,
    user: process.env.MYSQL_ADDON_USER || process.env.DB_USER,
    database: process.env.MYSQL_ADDON_DB || process.env.DB_NAME,
    ssl: (process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST.includes('azure.com'))) ? { rejectUnauthorized: false } : undefined
};

console.log("Testing DB Connection...");
console.log("Host:", config.host);
console.log("User:", config.user);
console.log("DB:", config.database);
console.log("SSL:", config.ssl ? "Enabled" : "Disabled");

const connection = mysql.createConnection({
    ...config,
    password: process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD,
    connectTimeout: 5000
});

connection.connect((err) => {
    if (err) {
        console.error("❌ Connection Failed:", err.message);
        console.error("Code:", err.code);
        if (err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
            console.log("💡 Suggestion: Check if your IP is whitelisted on the database server.");
        }
    } else {
        console.log("✅ Connection Successful!");
        connection.end();
    }
});
