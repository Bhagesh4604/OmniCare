const http = require('http');
const readline = require('readline');

// Configuration
const PORT = process.env.PORT || 8086; // Matches server/index.cjs default
const HOST = 'localhost';
const PATH = '/api/whatsapp/webhook';

// User identity for simulation
const PHONE_NUMBER = 'whatsapp:+1234567890';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`
==================================================
   WhatsApp Booking Simulator (CLI)
==================================================
Endpoint: http://${HOST}:${PORT}${PATH}
Simulating user: ${PHONE_NUMBER}

Type your message and press Enter to send.
Type 'exit' or 'quit' to close.

Ideas:
- "Hello"
- "I want to book an appointment"
- "I have a headache and fever"
==================================================
`);

function sendMessage(text) {
    if (!text.trim()) return prompt();

    const data = JSON.stringify({
        Body: text,
        From: PHONE_NUMBER
    });

    const options = {
        hostname: HOST,
        port: PORT,
        path: PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            // The server returns XML (TwiML)
            // We want to extract the message text from <Body>...</Body> or just show it raw

            // Simple regex to extract <Body> content if present
            const match = body.match(/<Body>(.*?)<\/Body>/s);
            const reply = match ? match[1] : body;

            console.log(`\n🤖 AI: ${reply}\n`);
            prompt();
        });
    });

    req.on('error', (e) => {
        console.error(`\n❌ Error connecting to server: ${e.message}`);
        console.error(`Make sure the backend is running (npm run server) on port ${PORT}.\n`);
        prompt();
    });

    req.write(data);
    req.end();
}

function prompt() {
    rl.question('You: ', (input) => {
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
            rl.close();
            process.exit(0);
        }
        sendMessage(input);
    });
}

// Start interaction
prompt();
