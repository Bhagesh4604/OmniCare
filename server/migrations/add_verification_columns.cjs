const { executeQuery } = require('../db.cjs');

/**
 * Migration: Add AI Verification Columns to emergencytrips Table
 * 
 * This migration adds three columns to support the AI accident verification feature:
 * - trip_image_url: Stores the path to the uploaded accident image
 * - verification_status: AI verification result (Verified/Suspected Fake/Error/No Image/Pending)
 * - verification_reason: AI-generated explanation of the verification decision
 */

const addVerificationColumns = () => {
    return new Promise((resolve, reject) => {
        // Check if columns already exist first
        const checkSql = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'emergencytrips'
      AND COLUMN_NAME IN ('trip_image_url', 'verification_status', 'verification_reason');
    `;

        executeQuery(checkSql, [], (err, results) => {
            if (err) {
                console.error('❌ Error checking existing columns:', err);
                return reject(err);
            }

            const existingColumns = results.map(row => row.COLUMN_NAME);

            if (existingColumns.length === 3) {
                console.log('✅ All verification columns already exist. No migration needed.');
                return resolve({ message: 'Columns already exist' });
            }

            if (existingColumns.length > 0) {
                console.log(`⚠️  Some columns already exist: ${existingColumns.join(', ')}`);
                console.log('Proceeding with conditional migration...');
            }

            // Construct ALTER TABLE statement only for missing columns
            const alterStatements = [];

            if (!existingColumns.includes('trip_image_url')) {
                alterStatements.push('ADD COLUMN trip_image_url VARCHAR(255) DEFAULT NULL AFTER notes');
            }

            if (!existingColumns.includes('verification_status')) {
                alterStatements.push("ADD COLUMN verification_status VARCHAR(50) DEFAULT 'Pending' AFTER " +
                    (existingColumns.includes('trip_image_url') ? 'trip_image_url' : 'notes'));
            }

            if (!existingColumns.includes('verification_reason')) {
                alterStatements.push('ADD COLUMN verification_reason TEXT DEFAULT NULL AFTER verification_status');
            }

            if (alterStatements.length === 0) {
                console.log('✅ All columns already exist.');
                return resolve({ message: 'No migration needed' });
            }

            const sql = `ALTER TABLE emergencytrips ${alterStatements.join(', ')};`;

            console.log('Running migration SQL:');
            console.log(sql);

            executeQuery(sql, [], (err, result) => {
                if (err) {
                    console.error('❌ Migration failed:', err);
                    console.error('SQL Error Code:', err.code);
                    console.error('SQL Error Message:', err.sqlMessage);
                    return reject(err);
                }

                console.log('✅ Successfully added verification columns to emergencytrips table');
                console.log('Migration result:', result);
                resolve(result);
            });
        });
    });
};

// Main migration execution
console.log('='.repeat(60));
console.log('MIGRATION: Add AI Verification Columns to emergencytrips');
console.log('='.repeat(60));

addVerificationColumns()
    .then((result) => {
        console.log('\n✅ Migration completed successfully');
        console.log('Result:', result);
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n❌ Migration failed');
        console.error('Error:', err);
        process.exit(1);
    });
