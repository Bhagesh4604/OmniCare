const mysql = require('mysql2');

console.log("Testing DB with INVALID user (Network Probe)...");

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'non_existent_user_xyz',
    password: 'wrong_password',
    database: 'hms',
    connectTimeout: 5000
});

connection.connect((err) => {
    if (err) {
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log("✅ Network is OK! (Got Expected Access Denied)");
        } else {
            console.log("❌ Network/Process Issue:", err.code, err.message);
        }
    } else {
        console.log("⚠️ Strangely connected with invalid user??");
    }
    connection.end();
});
