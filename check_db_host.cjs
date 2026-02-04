const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbHost = process.env.MYSQL_ADDON_HOST || process.env.DB_HOST;
console.log("--- DB HOST INFO ---");
console.log("DB_HOST raw:", process.env.DB_HOST);
console.log("MYSQL_ADDON_HOST raw:", process.env.MYSQL_ADDON_HOST);
console.log("Resolved Host:", dbHost);

if (dbHost && dbHost.includes('render.internal')) {
    console.log("WARNING: You appear to be using a Render INTERNAL hostname. This will only work if the app is running ON Render.");
    console.log("For local development, you must use the EXTERNAL hostname provided in the Render dashboard.");
} else if (dbHost === 'localhost' || !dbHost) {
    console.log("INFO: Host is localhost. Ensure your local MySQL server is running.");
} else {
    // Check if it's an IP or domain
    console.log(`INFO: Host is set to: ${dbHost}`);
    console.log("If this is a remote DB, ensure your IP is allowlisted or the DB accepts external connections.");
}
console.log("--------------------");
