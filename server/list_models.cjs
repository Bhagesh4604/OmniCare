const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const outFile = path.join(__dirname, 'available_models.txt');

        let output = "AVAILABLE MODELS:\n";
        if (data.models) {
            data.models.forEach(m => {
                // Log all models to be sure
                output += `- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})\n`;
            });
        } else {
            output += "No models found or error: " + JSON.stringify(data, null, 2);
        }

        fs.writeFileSync(outFile, output);
        console.log("Models written to " + outFile);

    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
