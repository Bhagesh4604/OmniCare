const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8086/api/inventory/batch';

async function testBlockchainAPI() {
    console.log("🚀 Starting Blockchain API Test...");

    const batchId = `BATCH-${Date.now()}`;
    const payload = {
        medicineId: 1, // Ensure this ID exists in your DB or use a known one
        batchNumber: batchId,
        manufacturer: "OmniCare Pharma",
        expiryDate: "2026-12-31",
        quantity: 100
    };

    try {
        // 1. Add Batch
        console.log(`\n1. Adding Batch: ${batchId}...`);
        const addRes = await fetch(`${BASE_URL}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const addData = await addRes.json();
        console.log("Response:", addData);

        if (!addData.success) {
            console.error("❌ Failed to add batch.");
            process.exit(1);
        }

        console.log("✅ Batch added to Ledger.");

        // Wait a bit for async operations if any (though in memory it's instant)
        await new Promise(r => setTimeout(r, 1000));

        // 2. Verify Batch
        console.log(`\n2. Verifying Batch: ${batchId}...`);
        const verifyRes = await fetch(`${BASE_URL}/verify/${batchId}`);
        const verifyData = await verifyRes.json();

        console.log("Response:", JSON.stringify(verifyData, null, 2));

        if (verifyData.success && verifyData.history.length > 0) {
            console.log("\n✅ SUCCESS: Blockchain verification passed!");
            console.log(`   Found ${verifyData.history.length} block(s) for this batch.`);
        } else {
            console.error("\n❌ FAILURE: Batch not verified.");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

testBlockchainAPI();
