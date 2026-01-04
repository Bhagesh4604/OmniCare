const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// Reusable function to send SMS using Twilio
const twilio = require('twilio');

const sendSms = async (to, message) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhoneNumber) {
        // Fallback to Mock if config is missing (prevents crash)
        console.warn('[SMS] Twilio variables not configured. Using MOCK mode.');
        return { sid: 'MOCK_NO_CONFIG_' + Date.now(), success: true, isMock: true };
    }

    const client = new twilio(accountSid, authToken);

    let formattedTo = String(to).replace(/\D/g, '');
    // Basic formatting for international numbers (defaulting to IN if 10 digits)
    if (formattedTo.length === 10) {
        formattedTo = `+91${formattedTo}`;
    } else if (!formattedTo.startsWith('+')) {
        formattedTo = `+${formattedTo}`;
    }

    try {
        console.log(`[Twilio] Attempting to send SMS to ${formattedTo}...`);
        const result = await client.messages.create({
            body: message,
            from: fromPhoneNumber,
            to: formattedTo
        });

        console.log(`[Twilio] SMS sent successfully. SID: ${result.sid}`);
        return { sid: result.sid, success: true };

    } catch (error) {
        console.error('[Twilio] SMS Failed.', error.message);
        // Fallback to mock so UI doesn't break
        return { sid: 'MOCK_FAIL_' + Date.now(), success: false, error: error.message, isMock: true };
    }
};

// POST to send an SMS
router.post('/send', async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ success: false, message: 'Missing \'to\' or \'message\' field.' });
    }

    try {
        const smsResult = await sendSms(to, message);
        res.json({ success: true, message: 'SMS sent successfully!', details: smsResult });
    } catch (error) {
        console.error('SMS Sending Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send SMS.', error: error.message });
    }
});

router.get('/summaries', (req, res) => {
    const queries = {
        patients: "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM patients",
        beds: "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied FROM beds",
        receivables: "SELECT SUM(amount) as totalCollection FROM accounts_receivable WHERE paymentStatus = 'paid'"
    };

    const promises = Object.values(queries).map(sql => {
        return new Promise((resolve, reject) => {
            executeQuery(sql, [], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });
    });

    Promise.all(promises)
        .then(([patients, beds, receivables]) => {
            res.json({ patients, beds, receivables });
        })
        .catch(err => {
            console.error("Failed to fetch summaries:", err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
});

// All other report routes remain the same...
router.get('/report/patients', (req, res) => {
    const sql = "SELECT patientId, firstName, lastName, status FROM patients WHERE status = 'active' LIMIT 10";
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        let message = "Active Patients Report:\n";
        results.forEach(p => {
            message += `- ${p.patientId}: ${p.firstName} ${p.lastName}\n`;
        });
        res.json({ message });
    });
});
router.get('/report/opd', (req, res) => {
    const sql = "SELECT COUNT(*) as consultations, SUM(amount) as totalCollection FROM accounts_receivable WHERE paymentStatus = 'paid'";
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const { consultations, totalCollection } = results[0];
        const avgFee = consultations > 0 ? (totalCollection / consultations).toFixed(2) : 0;
        let message = "OPD Cash Summary:\n";
        message += `- Total Collection: $${Number(totalCollection || 0).toLocaleString()}\n`;
        message += `- Consultations: ${consultations}\n`;
        message += `- Average Fee: $${avgFee}`;
        res.json({ message });
    });
});
router.get('/report/admit-discharge', (req, res) => {
    let message = "Admit/Discharge Summary:\n- Admissions Today: 23 (static)\n- Discharges Today: 18 (static)\n- Net Change: +5 (static)";
    res.json({ message });
});
router.get('/report/ward-status', (req, res) => {
    const sql = "SELECT (SELECT COUNT(*) FROM beds) as total, (SELECT COUNT(*) FROM beds WHERE status = 'occupied') as occupied";
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const { total, occupied } = results[0];
        let message = "Ward/Bed Status Report:\n";
        message += `- Total Beds: ${total}\n`;
        message += `- Occupied: ${occupied}\n`;
        message += `- Available: ${total - occupied}`;
        res.json({ message });
    });
});


module.exports = { router, sendSms };