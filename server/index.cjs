const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
// Azure Notification Hubs Setup
const { NotificationHubsClient } = require("@azure/notification-hubs");

let notificationHubService = null;

if (process.env.AZURE_NH_CONNECTION_STRING && process.env.AZURE_NH_HUB_NAME) {
  try {
    notificationHubService = new NotificationHubsClient(
      process.env.AZURE_NH_CONNECTION_STRING,
      process.env.AZURE_NH_HUB_NAME
    );
    console.log("✅ Azure Notification Hubs client initialized.");
  } catch (e) {
    console.error("🔴 Azure Notification Hubs initialization failed:", e);
  }
} else {
  console.warn("⚠️ Azure Notification Hub (AZURE_NH_CONNECTION_STRING, AZURE_NH_HUB_NAME) configuration missing. Push notifications disabled.");
}


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Make wss available to other modules
app.set('wss', wss);
app.set('notificationHubService', notificationHubService);

// DEBUG LOGGING MIDDLEWARE
app.use((req, res, next) => {
  console.log(`[SERVER REQUEST] ${req.method} ${req.url}`);
  next();
});

wss.on('connection', (ws) => {
  console.log('✅ Client connected to WebSocket');

  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('close', (code, reason) => {
    console.log(`❌ Client disconnected from WebSocket. Code: ${code}, Reason: ${reason}`);
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

// Keep-Alive Heartbeat
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

// --- CHANGE 1: Use Render's environment variable for PORT ---
const PORT = process.env.PORT || 8086; // Changed to 8086 to bypass zombie process on 8085

const allowedOrigins = [
  'https://localhost',
  'http://localhost',
  'capacitor://localhost',
  'http://localhost:8100',
  'https://shreemedicare1.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://192.168.0.100:5173',
  'http://192.168.1.103:5173',
  'http://192.168.1.103:5174', // New port detected
  'http://192.168.1.103:5175',
  'https://ressie-ectozoic-loida.ngrok-free.dev', // User's Ngrok URL
  'https://shreemedicare1.onrender.com',
  'https://omnicare-f9ahcchnfvdwhnd7.centralindia-01.azurewebsites.net' // Azure Deployment
];

const corsOptions = {
  origin: true, // Allow ALL origins for testing
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // Required for Twilio Webhooks & Large Uploads

// Middleware to attach wss to each request
app.use((req, res, next) => {
  req.wss = wss;
  next();
});

// Serve static files from the React app build directory - MOVED TO END
// app.use(express.static(path.join(__dirname, '..', 'dist')));
// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.


// API Routes
app.use('/api/auth', require('./auth.cjs'));
app.use('/api/auth/patient', require('./auth_patient.cjs'));
app.use('/api/dashboard', require('./dashboard.cjs'));
app.use('/api/patients', require('./patients.cjs'));
app.use('/api/immunizations', require('./immunizations.cjs'));
app.use('/api/medications', require('./medications.cjs'));
app.use('/api/body-monitor', require('./body_monitor.cjs')); // Smart Body Monitor
app.use('/api/portal', require('./portal.cjs'));
app.use('/api/employees', require('./employees.cjs'));
app.use('/api/pharmacy', require('./pharmacy.cjs'));
app.use('/api/accounting', require('./accounting.cjs'));
app.use('/api/billing', require('./billing.cjs')); // Add this line
app.use('/api/laboratory', require('./laboratory.cjs'));
app.use('/api/medical-records', require('./medicalRecords.cjs'));
app.use('/api/surgical', require('./surgical.cjs'));
app.use('/api/payroll', require('./payroll.cjs'));
app.use('/api/vendors', require('./vendors.cjs'));
app.use('/api/inventory', require('./inventory.cjs'));
app.use('/api/sms', require('./sms.cjs').router);
app.use('/api/portal', require('./portal.cjs'));
app.use('/api/appointments', require('./appointments.cjs'));
app.use('/api/virtual-consultations', require('./virtualConsultations.cjs')); // Add this line
app.use('/api/messaging', require('./messaging.cjs')); // Add this line
app.use('/api/schedules', require('./schedules.cjs'));
app.use('/api/ai', require('./aiService.cjs'));
app.use('/api/analytics', require('./analytics.cjs'));
app.use('/api/triage', require('./triage.cjs'));
app.use('/api/beds', require('./beds.cjs'));
app.use('/api/ems/patient', require('./ems_patient.cjs')); // New Patient-facing EMS routes (Must come before generic EMS)
app.use('/api/ems', require('./ems.cjs')); // New EMS routes
app.use('/api/speech', require('./speechToken.cjs')); // Azure Speech Token
app.use('/api/agent', require('./agentService.cjs')); // NEW AI AGENT
app.use('/api/whatsapp', require('./whatsappService.cjs')); // WhatsApp Integration
app.use('/api/monitoring', require('./monitoringService.cjs')); // LIVE MONITORING
app.use('/api/health-risk', require('./healthRiskPredictor.cjs')); // AI DISEASE RISK PREDICTOR
app.use('/api/mental-health', require('./mentalHealthCrisis.cjs')); // MENTAL HEALTH CRISIS DETECTION
app.use('/api/health', require('./healthCheck.cjs')); // Health Check logic

// === Phase 3: Blockchain & Analytics ===
const { medicareChain, Block } = require('./blockchainService.cjs');
const { predictWaitTime } = require('./analyticsService.cjs');

// Blockchain API
app.get('/api/blockchain/history/:patientId', (req, res) => {
  const { patientId } = req.params;
  // Filter chain for blocks relevant to this patient (in a real chain, you'd index this)
  const patientHistory = medicareChain.chain.filter(block =>
    block.data && block.data.patientId === patientId
  );
  res.json({ success: true, chain: patientHistory });
});

app.post('/api/blockchain/log', (req, res) => {
  const { patientId, doctorId, action } = req.body;
  if (!patientId || !doctorId) return res.status(400).json({ error: "Missing data" });

  const newBlock = new Block(
    Date.now(),
    new Date().toISOString(),
    { patientId, doctorId, action: action || "ACCESS_RECORD" }
  );
  medicareChain.addBlock(newBlock);
  res.json({ success: true, message: "Transaction logged to blockchain" });
});

// Predictive Analytics API
app.get('/api/analytics/predict-wait-time', (req, res) => {
  const waitTime = predictWaitTime();
  res.json({ success: true, waitTimeMinutes: waitTime });
});

const { translateText } = require('./translationService.cjs');

// Translation API
app.post('/api/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ success: false, message: 'Text and targetLanguage required' });
  }
  const translatedText = await translateText(text, targetLanguage);
  res.json({ success: true, translation: translatedText });
});

console.log("✅ '/api/beds' route registered successfully.");

// --- SMART CONTRACTS ENDPOINT (New 2026 Feature) ---
const smartContracts = require('./smartContracts.cjs');

app.post('/api/smart-contracts/verify-prescription', async (req, res) => {
  const { newDrug, patientHistory } = req.body;

  if (!newDrug) {
    return res.status(400).json({ success: false, message: "Drug name is required." });
  }

  try {
    const result = await smartContracts.checkInteractions(newDrug, patientHistory);
    // Simulate "Block Mining" delay for dramatic effect in UI
    setTimeout(() => {
      res.json({ success: true, ...result });
    }, 1500);
  } catch (error) {
    console.error("Smart Contract Error:", error);
    res.status(500).json({ success: false, message: "Smart Contract Execution Failed" });
  }
});

// --- SERVE FRONTEND (Production) ---
const distPath = path.join(__dirname, '..', 'dist');
if (require('fs').existsSync(distPath)) {
  console.log('📂 Serving static files from:', distPath);
  // Serve static files with proper caching
  app.use(express.static(distPath, { maxAge: '1y', immutable: true }));

  // Handle SPA routing: serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('⚠️ Distribution folder not found. Run "npm run build" to generate frontend assets.');
  app.get('/', (req, res) => {
    res.send('API Server is running. Frontend build not found. Run `npm run build`.');
  });
}

// --- CHANGE 2: Listen on '0.0.0.0' for Render/Azure ---
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});