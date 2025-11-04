const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET all medical records
router.get('/', (req, res) => {
    const sql = `
        SELECT mr.id, mr.recordDate, mr.diagnosis, mr.treatment, 
               CONCAT(p.firstName, ' ', p.lastName) as patientName, 
               CONCAT(e.firstName, ' ', e.lastName) as doctorName
        FROM medical_records mr
        JOIN patients p ON mr.patientId = p.id
        JOIN employees e ON mr.doctorId = e.id
        ORDER BY mr.recordDate DESC
    `;
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// POST a new medical record (and optionally a prescription)
router.post('/add', async (req, res) => {
    // transaction would be ideal here
    const { patientId, doctorId, recordDate, diagnosis, treatment, prescription, prescriptionNotes } = req.body;
    
    try {
        // Note: The form sends the patient's integer ID, not the varchar patientId. The column is patientId.
        const patientDbId = patientId;

        let fullTreatment = treatment;
        if (prescriptionNotes) {
            fullTreatment += `\n\nPrescription Notes:\n${prescriptionNotes}`;
        }

        // 1. First, insert the main medical record
        const medicalRecordSql = 'INSERT INTO medical_records (patientId, doctorId, recordDate, diagnosis, treatment) VALUES (?, ?, ?, ?, ?)';
        const medicalRecordParams = [patientDbId, doctorId, recordDate, diagnosis, fullTreatment];

        await new Promise((resolve, reject) => {
            executeQuery(medicalRecordSql, medicalRecordParams, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // 2. If prescription details were provided, create the full prescription entry
        if (prescription && prescription.medicationName && prescription.schedules.length > 0) {
            const prescriptionNumber = `PRES-${Date.now()}`;
            const prescriptionSql = 'INSERT INTO prescriptions (prescriptionNumber, patientId, doctorId, prescriptionDate, medicationName, dosage, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const prescriptionParams = [prescriptionNumber, patientDbId, doctorId, recordDate, prescription.medicationName, prescription.dosage, 'active'];

            const prescriptionResult = await new Promise((resolve, reject) => {
                executeQuery(prescriptionSql, prescriptionParams, (prescErr, prescResult) => {
                    if (prescErr) return reject(prescErr);
                    resolve(prescResult);
                });
            });

            const newPrescriptionId = prescriptionResult.insertId;

            // 3. Insert all scheduled times
            for (const schedule of prescription.schedules) {
                if (schedule.time) {
                    const scheduleSql = 'INSERT INTO prescription_schedules (prescriptionId, scheduledTime) VALUES (?, ?)';
                    await new Promise((resolve, reject) => {
                        executeQuery(scheduleSql, [newPrescriptionId, schedule.time], (err, result) => {
                            if (err) return reject(err);
                            resolve(result);
                        });
                    });
                }
            }
            res.json({ success: true, message: 'Medical record and prescription added successfully!' });
        } else {
            res.json({ success: true, message: 'Medical record added successfully!' });
        }
    } catch (error) {
        console.error("Error adding medical record or prescription:", error);
        res.status(500).json({ success: false, message: 'Failed to add medical record or prescription.' });
    }
});

// DELETE a medical record
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM medical_records WHERE id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete medical record' });
        res.json({ success: true, message: 'Medical record deleted successfully!' });
    });
});

module.exports = router;