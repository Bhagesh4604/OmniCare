const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET all surgery records
router.get('/', (req, res) => {
    const sql = `
        SELECT sr.*, 
               CONCAT(p.firstName, ' ', p.lastName) as patientName, 
               CONCAT(e.firstName, ' ', e.lastName) as surgeonName
        FROM surgery_records sr
        JOIN patients p ON sr.patientId = p.id
        JOIN employees e ON sr.surgeonId = e.id
        ORDER BY sr.surgeryDate DESC
    `;
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'DB Error', error: err });
        res.json(results);
    });
});

// POST a new surgery
router.post('/add', (req, res) => {
    const { surgeryNumber, patientId, surgeonId, surgeryType, surgeryDate, notes } = req.body;
    const sql = `INSERT INTO surgery_records (surgeryNumber, patientId, surgeonId, surgeryType, surgeryDate, notes, status) VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`;
    const params = [surgeryNumber, patientId, surgeonId, surgeryType, surgeryDate, notes];
    executeQuery(sql, params, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'DB Error', error: err });
        res.json({ success: true, message: 'Surgery scheduled successfully!' });
    });
});

// PUT (update) a surgery's status
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const sql = 'UPDATE surgery_records SET status = ? WHERE id = ?';
    executeQuery(sql, [status, id], (err, result) => {
        if (err) {
            console.error('Error updating surgery status:', err);
            return res.status(500).json({ success: false, message: 'Failed to update surgery status', error: err.message });
        }
        res.json({ success: true, message: 'Surgery status updated!' });
    });
});

// DELETE a surgery record
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM surgery_records WHERE id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete surgery record' });
        res.json({ success: true, message: 'Surgery record deleted successfully!' });
    });
});


module.exports = router;