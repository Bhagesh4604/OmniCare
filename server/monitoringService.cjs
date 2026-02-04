
const express = require('express');
const router = express.Router();

// Mock Data Store (In-memory for "Live" simulation)
const monitoredPatients = [
    { id: 1, firstName: 'John', lastName: 'Doe', patientId: 'PAT-001', current_hr: 72, current_risk: 15, profileImageUrl: null },
    { id: 2, firstName: 'Emma', lastName: 'Wilson', patientId: 'PAT-002', current_hr: 85, current_risk: 45, profileImageUrl: null },
    { id: 3, firstName: 'Robert', lastName: 'Brown', patientId: 'PAT-003', current_hr: 110, current_risk: 92, profileImageUrl: null }, // Critical
    { id: 7, firstName: 'Bhagesh', lastName: 'Biradar', patientId: 'PAT-6853', current_hr: 65, current_risk: 5, profileImageUrl: '/uploads/profilePhoto-1762203116075-947610701.jpg' }
];

const activeAlerts = [
    { alert_id: 101, firstName: 'Robert', lastName: 'Brown', severity: 'Critical', message: 'Sustained Tachycardia (>110 BPM)', timestamp: new Date().toISOString() }
];

// Helper to jitter data (Simulate live changes)
const updateVitals = () => {
    monitoredPatients.forEach(p => {
        // Random fluctuate HR by -2 to +2
        const delta = Math.floor(Math.random() * 5) - 2;
        p.current_hr = Math.max(40, Math.min(180, p.current_hr + delta));

        // Recalculate Risk (Fake Algorithm)
        if (p.current_hr > 100) p.current_risk = Math.min(100, p.current_risk + 5);
        else if (p.current_hr < 50) p.current_risk = Math.min(100, p.current_risk + 5);
        else p.current_risk = Math.max(0, p.current_risk - 2);
    });
};

// Update every second
setInterval(updateVitals, 1000);

// API Routes
router.get('/patients/monitored', (req, res) => {
    res.json({ success: true, patients: monitoredPatients });
});

router.get('/alerts/active', (req, res) => {
    res.json({ success: true, alerts: activeAlerts });
});

router.post('/alerts/resolve', (req, res) => {
    const { alert_id } = req.body;
    const idx = activeAlerts.findIndex(a => a.alert_id === alert_id);
    if (idx !== -1) {
        activeAlerts.splice(idx, 1);
        res.json({ success: true, message: 'Alert resolved' });
    } else {
        res.status(404).json({ success: false, message: 'Alert not found' });
    }
});

module.exports = router;
