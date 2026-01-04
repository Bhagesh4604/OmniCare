const { executeQuery } = require('./db.cjs');

const createTableSQL = `
CREATE TABLE IF NOT EXISTS government_prices (
    medicineId INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    maxPrice DECIMAL(10, 2) NOT NULL,
    lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

const seedData = [
    [1, 'Paracetamol 500mg', 45.00],
    [2, 'Amoxicillin 250mg', 120.50],
    [3, 'Insulin Glargine', 350.00],
    [4, 'Cetirizine 10mg', 15.00]
];

function setupGovtPricing() {
    console.log("🏛️  Setting up Government Pricing Registry...");

    // 1. Create Table
    executeQuery(createTableSQL, [], (err, result) => {
        if (err) {
            console.error("❌ Failed to create table:", err);
            return;
        }
        console.log("✅ Table 'government_prices' ready.");

        // 2. Seed Data
        seedData.forEach(([id, name, price]) => {
            const upsertSQL = `
                INSERT INTO government_prices (medicineId, name, maxPrice) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE maxPrice = VALUES(maxPrice), name = VALUES(name)
            `;
            executeQuery(upsertSQL, [id, name, price], (err, res) => {
                if (err) console.error(`❌ Failed to seed ${name}:`, err);
                else console.log(`   Detailed ${name} at $${price}`);
            });
        });
    });
}

setupGovtPricing();
