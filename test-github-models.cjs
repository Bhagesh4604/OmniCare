require('dotenv').config();
const { OpenAI } = require("openai");

async function testConnection() {
    console.log("Testing GitHub Models Connection...");
    console.log("Endpoint:", process.env.AZURE_OPENAI_ENDPOINT);
    console.log("Deployment:", process.env.AZURE_OPENAI_DEPLOYMENT_ID);

    if (!process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY.includes("YOUR_")) {
        console.error("❌ API Key is missing or default placeholder.");
        return;
    }

    const client = new OpenAI({
        baseURL: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_API_KEY
    });

    try {
        const response = await client.chat.completions.create({
            messages: [{ role: "user", content: "Hello, are you working?" }],
            model: process.env.AZURE_OPENAI_DEPLOYMENT_ID || "gpt-4o",
        });
        console.log("✅ Success! AI Replied:", response.choices[0].message.content);
    } catch (error) {
        console.error("❌ Connection Failed:", error.message);
        if (error.status === 401) console.error("   (Likely an invalid GitHub Token)");
        if (error.status === 404) console.error("   (Likely a wrong Model Name or Endpoint)");
    }
}

testConnection();
