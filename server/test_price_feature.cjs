const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:8086/api/inventory/batch/add';

async function createPricedBatch() {
    console.log("🚀 Creating Test Batches with Pricing...");

    // 1. Fair Price Batch (Paracetamol 500mg, Govt Price is 45.00)
    const fairBatch = {
        medicineId: 1,
        batchNumber: `BATCH-FAIR-${Date.now()}`,
        manufacturer: "OmniCare Pharma",
        expiryDate: "2026-12-31",
        quantity: 1000,
        price: 40.00 // Below 45.00 Cap
    };

    // 2. Overpriced Batch (Paracetamol 500mg, Govt Price is 45.00)
    const expensiveBatch = {
        medicineId: 1,
        batchNumber: `BATCH-EXPENSIVE-${Date.now()}`,
        manufacturer: "Greedy Pharma Inc.",
        expiryDate: "2026-12-31",
        quantity: 500,
        price: 60.00 // Above 45.00 Cap
    };

    try {
        // Add Fair Batch
        const res1 = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fairBatch)
        });
        const data1 = await res1.json();
        console.log("\n✅ Added Fair Price Batch:");
        console.log(`   Batch ID: ${fairBatch.batchNumber}`);
        console.log(`   Price: $${fairBatch.price} (Govt Cap: $45.00)`);
        console.log(`   Result: ${JSON.stringify(data1)}`);

        // Add Expensive Batch
        const res2 = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expensiveBatch)
        });
        const data2 = await res2.json();
        console.log("\n⚠️ Added Expensive Batch:");
        console.log(`   Batch ID: ${expensiveBatch.batchNumber}`);
        console.log(`   Price: $${expensiveBatch.price} (Govt Cap: $45.00)`);
        console.log(`   Result: ${JSON.stringify(data2)}`);

        console.log("\n📋 INSTRUCTIONS FOR USER:");
        console.log("---------------------------------------------------");
        console.log("1. Copy the 'Fair Price' Batch ID above.");
        console.log("2. Paste it into the Verifier App -> Expect GREEN Check.");
        console.log("3. Copy the 'Expensive' Batch ID above.");
        console.log("4. Paste it into the Verifier App -> Expect RED Warning.");
        console.log("---------------------------------------------------");

        const outputContent = `FAIR_BATCH:${fairBatch.batchNumber}\nEXPENSIVE_BATCH:${expensiveBatch.batchNumber}`;
        fs.writeFileSync(path.join(__dirname, 'latest_batch.txt'), outputContent);
        console.log("✅ Batch IDs saved to latest_batch.txt");

    } catch (error) {
        console.error("❌ Error running test script:", error);
    }
}

createPricedBatch();
