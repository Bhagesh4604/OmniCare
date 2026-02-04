const { executeQuery } = require('./db.cjs');

const sql = 'SELECT COUNT(*) as count FROM body_parts';

executeQuery(sql, [], (err, results) => {
    if (err) {
        console.error('Error querying body_parts:', err);
    } else {
        console.log('Body parts count:', results[0].count);
        if (results[0].count === 0) {
            console.log('Table is EMPTY.');
        } else {
            // Show a few rows
            executeQuery('SELECT * FROM body_parts LIMIT 5', [], (err, rows) => {
                console.log('First 5 rows:', rows);
            });
        }
    }
    process.exit();
});
