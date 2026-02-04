const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CLIENT FACTORY ---
function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes("YOUR_GEMINI_API_KEY_HERE")) {
        console.error("❌ Gemini API Key missing or default.");
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
}

// --- TOOLS DEFINITION (Gemini Format) ---
// Note: Gemini uses 'function_declarations' inside 'tools'
const toolDefinitions = [
    {
        name: "navigate",
        description: "Navigate to a specific page or module in the application",
        parameters: {
            type: "object",
            properties: {
                destination: {
                    type: "string",
                    enum: [
                        "dashboard", "patients", "pharmacy", "laboratory", "medical-records", "surgical", "billing", "accounting", "employees", "oncology", "paramedic", "fleet",
                        "patient-portal", "telemedicine", "patient-appointments", "patient-medications", "patient-records", "patient-billing", "patient-ambulance",
                        "patient-health-twin", "patient-heart-health", "patient-early-detection"
                    ],
                    description: "The internal route ID to navigate to."
                }
            },
            required: ["destination"]
        }
    },
    {
        name: "check_inventory",
        description: "Check stock levels of a specific medication or item",
        parameters: {
            type: "object",
            properties: {
                item_name: { type: "string", description: "Name of the medication or item" }
            },
            required: ["item_name"]
        }
    },
    {
        name: "fill_form",
        description: "Type text into a form field or input",
        parameters: {
            type: "object",
            properties: {
                field_label: {
                    type: "string",
                    description: "The visible label or placeholder of the input field"
                },
                value: {
                    type: "string",
                    description: "The text to type into the field"
                }
            },
            required: ["field_label", "value"]
        }
    },
    {
        name: "click_element",
        description: "Click a button or link on the page",
        parameters: {
            type: "object",
            properties: {
                element_text: {
                    type: "string",
                    description: "The visible text on the button or link"
                }
            },
            required: ["element_text"]
        }
    },
    {
        name: "get_patient_status",
        description: "Get status or vital signs of a specific patient",
        parameters: {
            type: "object",
            properties: {
                patient_name: { type: "string" }
            },
            required: ["patient_name"]
        }
    },
    {
        name: "book_ambulance",
        description: "Book an emergency ambulance for the patient (SOS)",
        parameters: {
            type: "object",
            properties: {},
            required: []
        }
    },
    {
        name: "check_symptoms",
        description: "Open the symptom checker or triage chat",
        parameters: {
            type: "object",
            properties: {},
            required: []
        }
    },
    {
        name: "check_appointments",
        description: "Check for upcoming appointments",
        parameters: {
            type: "object",
            properties: {},
            required: []
        }
    }
];

// --- MAIN ENDPOINT ---
router.post('/process', async (req, res) => {
    const { message, context, language } = req.body;
    const genAI = getGeminiClient();

    if (!genAI) {
        return res.status(500).json({ reply: "AI Agent is not configured (API Key Missing)." });
    }

    let langInstruction = "";
    if (language === 'hi-IN') langInstruction = "The user is speaking Hindi. You MUST reply in Hindi (Devanagari script).";
    else if (language === 'mr-IN') langInstruction = "The user is speaking Marathi. You MUST reply in Marathi (Devanagari script).";
    else langInstruction = "The user is speaking English. Reply in English.";

    const systemPrompt = `You are "MedAssist", a helpful, friendly, and highly intelligent hospital AI agent. 
    You act like a human co-worker. 
    1. Your responses should be conversational, professional but warm.
    2. USE TOOLS whenever the user asks to do something (navigate, check info).
    3. If the user just says hello, reply back normally.
    4. If you use a tool, reply with a confirmation message describing what you are doing.
    
    IMPORTANT: ${langInstruction}`;

    try {
        // Configure Model with Tools
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: [{
                functionDeclarations: toolDefinitions
            }]
        });

        // Chat Session
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }] // Send system prompt as first user message or mix
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am MedAssist, ready to help." }]
                }
            ]
        });

        const result = await chat.sendMessage(message);
        const response = result.response;

        // Check for function calls
        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            const funcName = call.name;
            const args = call.args;

            console.log(`[Agent] Calling Function: ${funcName}`, args);

            // Mock Data Logic
            let dataReply = null;

            if (funcName === 'check_inventory') {
                const stock = Math.floor(Math.random() * 100);
                dataReply = `Checking inventory for ${args.item_name}... We have ${stock} units in stock.`;
            }
            else if (funcName === 'get_patient_status') {
                dataReply = `Pulling records for ${args.patient_name}... Patient is stable. Last Vitals: HR 78, BP 120/80. Located in Ward 3.`;
            }
            else if (funcName === 'fill_form') {
                dataReply = `Typing "${args.value}" into ${args.field_label}...`;
            }
            else if (funcName === 'click_element') {
                dataReply = `Clicking ${args.element_text}...`;
            }
            else if (funcName === 'navigate') {
                const dest = args.destination.replace('-', ' ');
                dataReply = `Navigating to ${dest}...`;
            }
            else if (funcName === 'book_ambulance') {
                return res.json({
                    reply: "I am initiating the emergency ambulance protocol. Redirecting you to the SOS page now.",
                    action: { type: "navigate", payload: { destination: "patient-book-ambulance" } }
                });
            }
            else if (funcName === 'check_symptoms') {
                return res.json({
                    reply: "Opening the Symptom Checker Triage. Please tell the AI how you are feeling.",
                    action: { type: "open_modal", payload: { modal: "triage" } }
                });
            }
            else if (funcName === 'check_appointments') {
                dataReply = "I'm opening your appointments. You can see your upcoming visits here.";
                return res.json({
                    reply: dataReply,
                    action: { type: "navigate", payload: { destination: "patient-appointments" } }
                });
            }

            // For Gemini, we can just return the response now derived from the tool call
            return res.json({
                reply: dataReply || `Executing ${funcName}...`,
                action: {
                    type: funcName,
                    payload: args
                }
            });
        }

        // Normal text response
        return res.json({ reply: response.text(), action: null });

    } catch (error) {
        console.error("AI Agent Error:", error);
        res.status(500).json({ reply: "I'm sorry, I encountered an error processing your request." });
    }
});

module.exports = router;
