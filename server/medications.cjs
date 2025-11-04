const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// Get medications and adherence for a patient for the current day
router.get('/:patientId', async (req, res) => {
    const { patientId } = req.params;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    try {
        // 1. Get today's scheduled medications using the new table structure
        const scheduledDoses = await new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    p.id as prescriptionId,
                    p.medicationName,
                    p.dosage,
                    ps.scheduledTime,
                    CONCAT(e.firstName, ' ', e.lastName) as doctorName
                FROM prescriptions p
                JOIN prescription_schedules ps ON p.id = ps.prescriptionId
                JOIN employees e ON p.doctorId = e.id
                WHERE p.patientId = ? AND p.status = 'active'
            `;
            executeQuery(sql, [patientId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (scheduledDoses.length === 0) {
            return res.json({ success: true, medications: [] });
        }

        // 2. For each scheduled dose, check its adherence status
        const medicationSchedule = [];
        for (const dose of scheduledDoses) {
            const doseTime = new Date(`${today}T${dose.scheduledTime}`);

            const adherenceStatus = await new Promise((resolve, reject) => {
                const sql = "SELECT status FROM medication_adherence WHERE prescriptionId = ? AND DATE(doseTime) = ? AND HOUR(doseTime) = ? AND MINUTE(doseTime) = ?";
                executeQuery(sql, [dose.prescriptionId, today, doseTime.getHours(), doseTime.getMinutes()], (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0]?.status || 'scheduled');
                });
            });

            medicationSchedule.push({
                prescriptionId: dose.prescriptionId,
                medication: dose.medicationName,
                dosage: dose.dosage,
                doctorName: dose.doctorName,
                time: doseTime.toISOString(),
                status: adherenceStatus
            });
        }

        res.json({ success: true, medications: medicationSchedule.sort((a,b) => new Date(a.time) - new Date(b.time)) });

    } catch (error) {
        console.error('Error fetching medication schedule:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// Track a dose
router.post('/track', async (req, res) => {
    const { patientId, prescriptionId, doseTime, status } = req.body;

    if (!patientId || !prescriptionId || !doseTime || !status) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    if (!['taken', 'skipped'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    try {
        // Use INSERT ... ON DUPLICATE KEY UPDATE to either create or update the record
        const sql = `
            INSERT INTO medication_adherence (patientId, prescriptionId, doseTime, status, recordedAt)
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE status = VALUES(status), recordedAt = NOW();
        `;

        await new Promise((resolve, reject) => {
            executeQuery(sql, [patientId, prescriptionId, doseTime, status], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({ success: true, message: 'Adherence recorded.' });

    } catch (error) {
        console.error('Error tracking medication:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

module.exports = router;
