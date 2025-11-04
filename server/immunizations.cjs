const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET all immunization records
router.get('/', (req, res) => {
    const sql = `
        SELECT i.*, CONCAT(p.firstName, ' ', p.lastName) as patientName, CONCAT(e.firstName, ' ', e.lastName) as administeredByDoctorName
        FROM immunizations i
        JOIN patients p ON i.patientId = p.id
        LEFT JOIN employees e ON i.administeredByDoctorId = e.id
        ORDER BY i.vaccinationDate DESC
    `;
    executeQuery(sql, [], (err, results) => {
        if (err) {
            console.error('Error fetching all immunization records:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        res.json(results);
    });
});

// GET all immunization records for a specific patient
router.get('/:patientId', (req, res) => {
    const { patientId } = req.params;
    const sql = `
        SELECT i.*, CONCAT(e.firstName, ' ', e.lastName) as administeredByDoctorName
        FROM immunizations i
        LEFT JOIN employees e ON i.administeredByDoctorId = e.id
        WHERE i.patientId = ?
        ORDER BY i.vaccinationDate DESC
    `;
    executeQuery(sql, [patientId], (err, results) => {
        if (err) {
            console.error('Error fetching immunization records:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        res.json(results);
    });
});

// POST a new immunization record
router.post('/add', (req, res) => {
    const { patientId, vaccineName, vaccinationDate, doseNumber, administeredByDoctorId, notes, nextDueDate } = req.body;
    const sql = 'INSERT INTO immunizations (patientId, vaccineName, vaccinationDate, doseNumber, administeredByDoctorId, notes, nextDueDate) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [patientId, vaccineName, vaccinationDate, doseNumber || 1, administeredByDoctorId || null, notes || null, nextDueDate || null];
    executeQuery(sql, params, (err, result) => {
        if (err) {
            console.error('Error adding immunization record:', err);
            return res.status(500).json({ success: false, message: 'Failed to add immunization record' });
        }
        res.json({ success: true, message: 'Immunization record added successfully!' });
    });
});

// PUT (update) an existing immunization record
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { vaccineName, vaccinationDate, doseNumber, administeredByDoctorId, notes, nextDueDate } = req.body;
    const sql = 'UPDATE immunizations SET vaccineName = ?, vaccinationDate = ?, doseNumber = ?, administeredByDoctorId = ?, notes = ?, nextDueDate = ? WHERE id = ?';
    const params = [vaccineName, vaccinationDate, doseNumber || 1, administeredByDoctorId || null, notes || null, nextDueDate || null, id];
    executeQuery(sql, params, (err, result) => {
        if (err) {
            console.error('Error updating immunization record:', err);
            return res.status(500).json({ success: false, message: 'Failed to update immunization record' });
        }
        res.json({ success: true, message: 'Immunization record updated successfully!' });
    });
});

// DELETE an immunization record
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM immunizations WHERE id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting immunization record:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete immunization record' });
        }
        res.json({ success: true, message: 'Immunization record deleted successfully!' });
    });
});

module.exports = router;
