const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');
const twilio = require('twilio');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CONFIGURATION ---
// Twilio Config
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = accountSid && authToken ? new twilio(accountSid, authToken) : null; 
// Commented out to prevent crash if twilio not configured locally. 
// Ideally we check before use or keep as null.

function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes("YOUR_GEMINI_API_KEY_HERE")) {
        console.error("❌ Gemini API Key missing or default.");
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
}

// --- DB HELPERS ---
async function identifyUser(phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const last10 = cleanPhone.slice(-10);

    return new Promise((resolve) => {
        const sqlPatient = "SELECT * FROM patients WHERE phone LIKE ?";
        executeQuery(sqlPatient, [`%${last10}`], (err, patients) => {
            if (!err && patients.length > 0) {
                resolve({ role: 'patient', data: patients[0] });
                return;
            }
            const sqlEmployee = "SELECT * FROM employees WHERE phone LIKE ? AND role = 'doctor'";
            executeQuery(sqlEmployee, [`%${last10}`], (err, doctors) => {
                if (!err && doctors.length > 0) {
                    resolve({ role: 'doctor', data: doctors[0] });
                    return;
                }
                resolve({ role: 'unknown', data: null });
            });
        });
    });
}

// --- TOOLS DEFINITIONS ---

const patientTools = [
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
];

const doctorTools = [
    {
        name: "get_schedule",
        description: "Get the doctor's appointment schedule for a specific day",
        parameters: {
            type: "object",
            properties: {
                date: { type: "string", description: "Date (e.g., 'today', 'tomorrow')" }
            },
            required: ["date"]
        }
    },
    {
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
];


// --- SIMULATION STORE ---
const chatHistory = {};

// --- SHARED PROCESSING LOGIC ---
async function processAIResponse(userMessage, phoneNumber, language = 'en', forceRole = null, locationData = null) {
    const genAI = getGeminiClient();
    if (!genAI) return "AI Service Helper: Gemini API Key missing.";

    // 1. Identify User Role
    let userContext = { role: 'unknown', data: null };
    if (forceRole) {
        userContext.role = forceRole;
    } else {
        userContext = await identifyUser(phoneNumber);
    }
    console.log(`[WhatsApp] User Identified: ${phoneNumber} -> ${userContext.role}`);

    // 2. Select Tools & System Prompt
    let roleTools = [];
    let systemPrompt = "";
    let langInstruction = "Reply in English. Keep it concise for WhatsApp.";
    if (language === 'hi') langInstruction = "Reply in Hindi (Devanagari). Keep it concise.";
    else if (language === 'mr') langInstruction = "Reply in Marathi (Devanagari). Keep it concise.";

    let locationContext = "";
    if (locationData) {
        locationContext = `\n[SYSTEM NOTICE]: User has sent LIVE LOCATION: Lat ${locationData.lat}, Lon ${locationData.lon}. If they ask for ambulance, use these coordinates.`;
    }

    if (userContext.role === 'doctor') {
        roleTools = doctorTools;
        const doctorName = userContext.data ? `${userContext.data.firstName} ${userContext.data.lastName}` : "Doctor";
        systemPrompt = `You are "MedAssist" for Doctors. You are speaking to Dr. ${doctorName}.
        1. Help them check their schedule and patient info.
        2. Be professional and concise.
        3. ${langInstruction}${locationContext}`;
    } else {
        roleTools = patientTools;
        const patientName = userContext.data ? `${userContext.data.firstName}` : "Patient";
        systemPrompt = `You are "MedAssist", a hospital patient assistant.
        1. Help ${patientName} book appointments, check symptoms, or book an ambulance.
        2. Be warm and concise.
        3. ${langInstruction}${locationContext}`;
    }

    // 3. Init Chat History
    if (!chatHistory[phoneNumber]) {
        chatHistory[phoneNumber] = [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood. I am MedAssist." }] }
        ];
    }

    let content = userMessage;
    if (!content && locationData) {
        content = `[User Shared Location: ${locationData.lat}, ${locationData.lon}]`;
    } else if (content && locationData) {
        content += ` [Location Shared: ${locationData.lat}, ${locationData.lon}]`;
    }

    // Add User Message to History (if using persistent chat object, but here we reconstruct history for the stateless request or use startChat with history)
    // For simplicity in this functional stateless wrapper, we'll just push to our local history array and send that.
    // However, Gemini `startChat` maintains history in the session object. 
    // To mimic the persistent `chatHistory` object across requests, we need to map our simpler format to Gemini's expected history format.

    // Gemini History Format: { role: "user"|"model", parts: [{ text: "..." }] }

    // We already initialized history with system prompt.
    // Let's add the new user message.
    // NOTE: Gemini "user" role is valid.

    // 4. Configure Model
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        tools: [{ functionDeclarations: roleTools }]
    });

    try {
        const chat = model.startChat({
            history: chatHistory[phoneNumber]
        });

        const result = await chat.sendMessage(content);
        const response = result.response;

        let finalReply = response.text(); // Default reply

        const functionCalls = response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            // Handle Tool Call
            const call = functionCalls[0];
            const funcName = call.name;
            const args = call.args;

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

                // Prioritize real location
                let lat = 12.9716, lon = 77.5946; // Mock defaults
                if (locationData && locationData.lat) {
                    lat = parseFloat(locationData.lat);
                    lon = parseFloat(locationData.lon);
                } else {
                    // Random jitter if mock
                    lat += (Math.random() * 0.01 - 0.005);
                    lon += (Math.random() * 0.01 - 0.005);
                }

                const notes = `${args.emergency_type || 'General Emergency'} - WA LocationRef: ${args.location}`;
                if (patientId) {
                    const sql = `INSERT INTO emergencytrips (trip_id, status, alert_source, scene_location_lat, scene_location_lon, patient_name, notes, patient_id, booked_by_patient_id, alert_timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
                    executeQuery(sql, [tripId, 'New_Alert', 'WhatsApp', lat, lon, patientName, notes, patientId, patientId], (err) => { });
                }
                toolResultContent = `[System: AMBULANCE DISPATCHED! TripID: ${tripId}. Driver headed to ${lat.toFixed(4)}, ${lon.toFixed(4)}. ETA: 10 mins.]`;
            }
            // --- DOCTOR TOOLS ---
            else if (funcName === 'get_schedule') {
                toolResultContent = `[System: Dr. Schedule for ${args.date}: 10:00 AM John Doe, 11:30 AM Sarah Smith.]`;
            } else if (funcName === 'get_patient_info') {
                toolResultContent = `[System: Patient ${args.patient_name}: 34/M. Last visit: 2 days ago. Stable.]`;
            }

            // Send Tool Result back to Gemini
            const result2 = await chat.sendMessage([
                {
                    functionResponse: {
                        name: funcName,
                        response: { content: toolResultContent }
                    }
                }
            ]);
            finalReply = result2.response.text();
        }

        // Update local history (Gemini chat object maintains it internally for the session, 
        // but we need to sync our simplified `chatHistory` for the next request since we re-instantiate `startChat` each time??
        // Wait, `startChat` history arg initializes the chat. It doesn't sync back to our array variable automatically if we don't grab it.
        // Actually, for a simple implementation, we can just push the messages we successfully processed.

        chatHistory[phoneNumber].push({ role: "user", parts: [{ text: content }] });
        chatHistory[phoneNumber].push({ role: "model", parts: [{ text: finalReply }] });

        // Limit history size
        if (chatHistory[phoneNumber].length > 20) chatHistory[phoneNumber] = chatHistory[phoneNumber].slice(-20);

        return finalReply;

    } catch (e) {
        console.error("AI Error:", e);
        return "MedAssist Offline (Error).";
    }
}

// --- ENDPOINT: SIMULATE ---
router.post('/simulate', async (req, res) => {
    const { message, phoneNumber, language, location } = req.body;
    const reply = await processAIResponse(message, phoneNumber, language, null, location);
    res.json({ reply });
});

// --- REAL WEBHOOK (Twilio) ---
router.post('/webhook', async (req, res) => {
    const incomingMsg = req.body.Body || '';
    const from = req.body.From;
    let locationData = null;
    if (req.body.Latitude && req.body.Longitude) {
        locationData = { lat: req.body.Latitude, lon: req.body.Longitude };
    }
    const lang = /[\u0900-\u097F]/.test(incomingMsg) ? 'hi' : 'en';

    const replyText = await processAIResponse(incomingMsg, from, lang, null, locationData);

    const MessagingResponse = require('twilio').twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message(replyText);

    res.type('text/xml');
    res.send(twiml.toString());
});

module.exports = router;
