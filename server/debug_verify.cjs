const fetch = require('node-fetch');

const BATCH_ID = 'BATCH-EXPENSIVE-1767511059865';
const API_URL = `http://localhost:8086/api/inventory/batch/verify/${BATCH_ID}`;

const fs = require('fs');
const path = require('path');

async function verifyBatch() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const outputPath = path.join(__dirname, 'debug_output.json');
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log("Debug output saved to debug_output.json");

    } catch (error) {
        console.error("Error fetching verification:", error);
    }
}

verifyBatch();
