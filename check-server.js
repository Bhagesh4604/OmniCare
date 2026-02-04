import http from 'http';

const options = {
    hostname: 'localhost',
    port: 8086,
    path: '/api/ai/identify-medicine',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log(`Checking connection to http://localhost:${options.port}${options.path}...`);

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('BODY HEAD (First 200 chars):');
        console.log(data.substring(0, 200));

        if (data.trim().startsWith('<')) {
            console.log("\n❌ FATAL: Received HTML! Routing is broken or hitting catch-all.");
        } else if (res.statusCode === 400 || res.statusCode === 200) {
            console.log("\n✅ SUCCESS: Backend is responding with JSON.");
        } else {
            console.log("\n⚠️ WARNING: Unexpected Status.");
        }
    });
});

req.on('error', (e) => {
    console.error(`\n❌ ERROR: Connection failed: ${e.message}`);
    console.error("The backend server is likely NOT running on port 8086.");
});

req.end();
