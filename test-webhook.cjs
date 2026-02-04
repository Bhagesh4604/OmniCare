const http = require('http');

// Twilio usually sends 'application/x-www-form-urlencoded' by default for webhooks,
// but let's try JSON first as my code might handle both if body-parser is set up.
// Actually, looking at index.cjs: app.use(bodyParser.json()); 
// Ideally Twilio sends form-data. But the whatsappService.cjs reads req.body.Body directly.
// If body-parser only handles JSON, then form data might be empty.
// Let's check index.cjs again... it has bodyParser.json(). Does it have urlencoded?
// Often bodyParser.urlencoded is needed for Twilio.
// Let's assume JSON for this specific test first, but if it fails to read 'Body', that's a clue.

const data = JSON.stringify({
    Body: 'Hello',
    From: 'whatsapp:+1234567890'
});

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/whatsapp/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
