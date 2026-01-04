const express = require('express');
const router = express.Router();
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const { OpenAI } = require("openai");
const { executeQuery } = require('./db.cjs'); // Import DB for user lookup
const twilio = require('twilio');

// --- CONFIGURATION ---
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID || "gpt-4o";

// Twilio Config
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = accountSid && authToken ? new twilio(accountSid, authToken) : null;

// --- CLIENT FACTORY ---
function getClient() {
    if (!endpoint || !apiKey) return null;
    if (endpoint.includes("inference.ai.azure.com")) {
        return { client: new OpenAI({ baseURL: endpoint, apiKey: apiKey }), isGitHub: true };
    }
    return { client: new OpenAIClient(endpoint, new AzureKeyCredential(apiKey)), isGitHub: false };
}

// --- DB HELPERS ---
async function identifyUser(phoneNumber) {
    // 1. Check Patients
    // Normalize phone number if needed (e.g. remove +91 or add it). For now, basic check.
    // Assuming DB stores raw numbers or matching format.

    // Clean phone number for matching: remove + and spaces
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    // Try matching last 10 digits
    const last10 = cleanPhone.slice(-10);

    return new Promise((resolve) => {
        // Search Patients
        const sqlPatient = "SELECT * FROM patients WHERE phone LIKE ?";
        executeQuery(sqlPatient, [`%${last10}`], (err, patients) => {
            if (!err && patients.length > 0) {
                resolve({ role: 'patient', data: patients[0] });
                return;
            }

            // Search Doctors (Employees with role='doctor')
            const sqlEmployee = "SELECT * FROM employees WHERE phone LIKE ? AND role = 'doctor'";
            executeQuery(sqlEmployee, [`%${last10}`], (err, doctors) => {
                if (!err && doctors.length > 0) {
                    resolve({ role: 'doctor', data: doctors[0] });
                    return;
                }

                // Default: Unknown / New User
                resolve({ role: 'unknown', data: null });
            });
        });
    });
}

// --- TOOLS DEFINITIONS ---

const patientTools = [
    {
        type: "function",
        function: {
            name: "check_appointment_slots",
            description: "Check available appointment slots for a specific department or doctor",
            parameters: {
                type: "object",
                properties: {
                    department: { type: "string", description: "e.g. Cardiology, Orthopedics, General" },
                    date: { type: "string", description: "Date requested (e.g. 'tomorrow', 'next Monday')" }
                },
                required: ["department"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "book_appointment",
            description: "Book an appointment for the patient",
            parameters: {
                type: "object",
                properties: {
                    doctor_name: { type: "string" },
                    time: { type: "string" },
                    patient_name: { type: "string" }
                },
                required: ["doctor_name", "time", "patient_name"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "check_symptoms",
            description: "Analyze symptoms and provide initial triage advice",
            parameters: {
                type: "object",
                properties: {
                    symptoms: { type: "string", description: "List of symptoms described by user" },
                    duration: { type: "string", description: "How long they have had them" }
                },
                required: ["symptoms"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "book_ambulance",
            description: "Book an emergency ambulance for the patient immediately",
            parameters: {
                type: "object",
                properties: {
                    location: { type: "string", description: "Current location or address of the emergency" },
                    emergency_type: { type: "string", description: "Type of emergency (e.g., Accident, Heart Attack, Unconscious)" }
                },
                required: ["location"]
            }
        }
    }
];

const doctorTools = [
    {
        type: "function",
        function: {
            name: "get_schedule",
            description: "Get the doctor's appointment schedule for a specific day",
            parameters: {
                type: "object",
                properties: {
                    date: { type: "string", description: "Date (e.g., 'today', 'tomorrow')" }
                },
                required: ["date"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_patient_info",
            description: "Get basic information about a patient",
            parameters: {
                type: "object",
                properties: {
                    patient_name: { type: "string" }
                },
                required: ["patient_name"]
            }
        }
    }
];


// --- SIMULATION STORE ---
const chatHistory = {};

// --- SHARED PROCESSING LOGIC ---
async function processAIResponse(userMessage, phoneNumber, language = 'en', forceRole = null, locationData = null) {
    const { client: aiClient, isGitHub } = getClient();
    if (!aiClient) return "Azure AI not configured.";

    // 1. Identify User Role (if real phone number)
    let userContext = { role: 'unknown', data: null };
    if (forceRole) {
        userContext.role = forceRole;
    } else {
        userContext = await identifyUser(phoneNumber);
    }

    console.log(`[WhatsApp] User Identified: ${phoneNumber} -> ${userContext.role}`);

    // 2. Select Tools & System Prompt based on Role
    let roleTools = [];
    let systemPrompt = "";

    let langInstruction = "Reply in English. Keep it concise for WhatsApp.";
    if (language === 'hi') langInstruction = "Reply in Hindi (Devanagari). Keep it concise.";
    else if (language === 'mr') langInstruction = "Reply in Marathi (Devanagari). Keep it concise.";

    // Inject Location Context if available
    let locationContext = "";
    if (locationData) {
        locationContext = `\n[SYSTEM NOTICE]: User has sent their Live Location: Lat ${locationData.lat}, Lon ${locationData.lon}. If they ask for an ambulance, use these EXACT coordinates.`;
    }

    if (userContext.role === 'doctor') {
        roleTools = doctorTools;
        const doctorName = userContext.data ? `${userContext.data.firstName} ${userContext.data.lastName}` : "Doctor";
        systemPrompt = `You are "MedAssist" for Doctors. You are speaking to Dr. ${doctorName}.
        1. Help them check their schedule and patient info.
        2. Be professional and concise.
        3. ${langInstruction}${locationContext}`;
    } else {
        // Patient or Unknown
        roleTools = patientTools;
        const patientName = userContext.data ? `${userContext.data.firstName}` : "Patient";
        systemPrompt = `You are "MedAssist", a hospital patient assistant.
        1. Help ${patientName} book appointments, check symptoms, or book an ambulance.
        2. Be warm and concise.
        3. ${langInstruction}${locationContext}`;
    }

    // 3. Init History
    if (!chatHistory[phoneNumber]) {
        chatHistory[phoneNumber] = [];
    }

    // If user sent a location but no text, treat it as a location share
    let content = userMessage;
    if (!content && locationData) {
        content = `[User Shared Location: ${locationData.lat}, ${locationData.lon}]`;
    } else if (content && locationData) {
        content += ` [Location Shared: ${locationData.lat}, ${locationData.lon}]`;
    }

    chatHistory[phoneNumber].push({ role: "user", content: content });

    const messages = [
        { role: "system", content: systemPrompt },
        ...chatHistory[phoneNumber]
    ];

    try {
        let finalReply = "";

        // --- CALL AI ---
        let result;
        if (isGitHub) {
            result = await aiClient.chat.completions.create({ model: deploymentId, messages: messages, tools: roleTools });
        } else {
            result = await aiClient.getChatCompletions(deploymentId, messages, { tools: roleTools });
        }

        const choice = result.choices[0];
        const toolCalls = isGitHub ? choice.message.tool_calls : choice.message.toolCalls;

        finalReply = choice.message.content;

        // --- HANDLE TOOL CALLS ---
        if (toolCalls && toolCalls.length > 0) {
            const tool = toolCalls[0];
            const funcName = isGitHub ? tool.function.name : tool.function.name;
            const args = JSON.parse(isGitHub ? tool.function.arguments : tool.function.arguments);

            let toolResultContent = "";

            // --- PATIENT TOOLS ---
            if (funcName === 'check_appointment_slots') {
                toolResultContent = `[System: Slots available for ${args.department}: 10:00 AM, 2:00 PM (Tomorrow)]`;
            } else if (funcName === 'book_appointment') {
                toolResultContent = `[System: Appointment Booked: ${args.patient_name} with ${args.doctor_name} at ${args.time}. ID: BK-${Date.now().toString().slice(-4)}]`;
            } else if (funcName === 'check_symptoms') {
                toolResultContent = `[System: Triage Advice: Based on ${args.symptoms}, recommend General Consultation. Red flags: None.]`;
            } else if (funcName === 'book_ambulance') {
                // --- AMBULANCE LOGIC ---
                const tripId = `WA-${Date.now()}`;
                const patientId = userContext.data ? userContext.data.id : null;
                const patientName = userContext.data ? `${userContext.data.firstName} ${userContext.data.lastName}` : "Unknown (WhatsApp)";

                // Determine Location: Use Real Location if shared, else Mock
                let lat, lon;
                if (locationData && locationData.lat && locationData.lon) {
                    lat = parseFloat(locationData.lat);
                    lon = parseFloat(locationData.lon);
                    console.log(`[Ambulance] Using REAL WhatsApp Location: ${lat}, ${lon}`);
                } else {
                    // Mock Location (Near Hospital Base)
                    lat = 12.9716 + (Math.random() * 0.01 - 0.005);
                    lon = 77.5946 + (Math.random() * 0.01 - 0.005);
                    console.log(`[Ambulance] Using MOCK Location: ${lat}, ${lon}`);
                }

                const notes = `${args.emergency_type || 'General Emergency'} - LocationRef: ${args.location}`;

                if (patientId) {
                    // DB Insert
                    const sql = `INSERT INTO emergencytrips (trip_id, status, alert_source, scene_location_lat, scene_location_lon, patient_name, notes, patient_id, booked_by_patient_id, alert_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

                    // Simple non-blocking Insert
                    executeQuery(sql, [tripId, 'New_Alert', 'WhatsApp', lat, lon, patientName, notes, patientId, patientId], (err, res) => {
                        if (err) console.error("WhatsApp Ambulance Book Error", err);
                    });
                }

                toolResultContent = `[System: AMBULANCE DISPATCHED! TripID: ${tripId}. Driver is headed to: ${lat.toFixed(4)}, ${lon.toFixed(4)}. ETA: 8-12 mins.]`;
            }
            // --- DOCTOR TOOLS ---
            else if (funcName === 'get_schedule') {
                // In real app, query 'appointments' table
                toolResultContent = `[System: Dr. Schedule for ${args.date}: 
                - 10:00 AM: John Doe (Checkup)
                - 11:30 AM: Sarah Smith (Follow-up)
                - 02:00 PM: Mike Ross (New Patient)]`;
            } else if (funcName === 'get_patient_info') {
                toolResultContent = `[System: Patient ${args.patient_name}: 34/M. Last visit: 2 days ago. Diagnosis: Hypertension.]`;
            }

            // Second Turn
            messages.push(choice.message);
            messages.push({ role: "tool", tool_call_id: tool.id, name: funcName, content: toolResultContent });

            let secondResult;
            if (isGitHub) {
                secondResult = await aiClient.chat.completions.create({ model: deploymentId, messages: messages });
            } else {
                secondResult = await aiClient.getChatCompletions(deploymentId, messages);
            }
            finalReply = secondResult.choices[0].message.content;
        }

        if (!finalReply) finalReply = "I'm listening..."; // Fallback

        chatHistory[phoneNumber].push({ role: "assistant", content: finalReply });
        return finalReply;

    } catch (e) {
        console.error("AI Error:", e);
        return "Sorry, I am having trouble connecting to the AI. Please try again.";
    }
}


// --- ENDPOINT: SIMULATE ---
router.post('/simulate', async (req, res) => {
    const { message, phoneNumber, language, location } = req.body;

    // Pass location if provided in simulation (e.g. { lat: 12.9, lon: 77.6 })
    const reply = await processAIResponse(message, phoneNumber, language, null, location);
    res.json({ reply });
});

// --- REAL WEBHOOK (Twilio) ---
router.post('/webhook', async (req, res) => {
    const incomingMsg = req.body.Body || '';
    const from = req.body.From; // e.g., "whatsapp:+1234567890"

    // Extract Location if present (Twilio specific fields)
    let locationData = null;
    if (req.body.Latitude && req.body.Longitude) {
        locationData = {
            lat: req.body.Latitude,
            lon: req.body.Longitude
        };
        console.log(`[Twilio Webhook] Location Received: ${locationData.lat}, ${locationData.lon}`);
    }

    // Detect Language? (Naive check or let AI handle it)
    // For now, assume English or detect Script.
    // Basic Hindi detection: Devanagari range
    const isHindiOrMarathi = /[\u0900-\u097F]/.test(incomingMsg);
    const lang = isHindiOrMarathi ? 'hi' : 'en'; // Default to Hindi for Devanagari, else English. 
    // Ideally user specific pref.

    console.log(`[Twilio Webhook] From: ${from}, Msg: ${incomingMsg}`);

    const replyText = await processAIResponse(incomingMsg, from, lang, null, locationData);

    // Send Response via Twilio
    // We can use twiml or the client. Using TwiML here is standard for synchronous webhook response.
    const MessagingResponse = require('twilio').twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message(replyText);

    res.type('text/xml');
    res.send(twiml.toString());
});

module.exports = router;
