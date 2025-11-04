const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET all medicines
router.get('/medicines', (req, res) => {
    const sql = `
        SELECT p.*, pc.name as categoryName 
        FROM pharmaceuticals p 
        LEFT JOIN pharmaceutical_categories pc ON p.categoryId = pc.id
    `;
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// GET all medicine categories
router.get('/categories', (req, res) => {
    const sql = `SELECT * FROM pharmaceutical_categories`;
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// GET all active prescriptions for the pharmacy view
router.get('/prescriptions', (req, res) => {
    const sql = `
        SELECT 
            p.id,
            p.prescriptionNumber,
            p.prescriptionDate,
            p.medicationName,
            p.dosage,
            p.status,
            CONCAT(pt.firstName, ' ', pt.lastName) as patientName,
            pt.patientId as patientIdentifier,
            CONCAT(e.firstName, ' ', e.lastName) as doctorName
        FROM prescriptions p
        JOIN patients pt ON p.patientId = pt.id
        JOIN employees e ON p.doctorId = e.id
        WHERE p.status = 'active'
        ORDER BY p.prescriptionDate DESC
    `;
    executeQuery(sql, [], (err, results) => {
        if (err) {
            console.error("Error fetching prescriptions for pharmacy:", err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        res.json(results);
    });
});

// Update a prescription status (e.g., to 'filled')
router.put('/prescriptions/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const sql = 'UPDATE prescriptions SET status = ? WHERE id = ?';
    executeQuery(sql, [status, id], (err, result) => {
        if (err) {
            console.error(`Error updating prescription ${id}:`, err);
            return res.status(500).json({ success: false, message: 'Failed to update prescription status.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Prescription not found.' });
        }
        res.json({ success: true, message: 'Prescription status updated successfully.' });
    });
});

// POST a new medicine
router.post('/medicines/add', (req, res) => {
    const { name, categoryId, description, dosageForm, strength, unitPrice, stockQuantity, reorderLevel } = req.body;
    const sql = 'INSERT INTO pharmaceuticals (name, categoryId, description, dosageForm, strength, unitPrice, stockQuantity, reorderLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    executeQuery(sql, [name, categoryId, description, dosageForm, strength, unitPrice, stockQuantity, reorderLevel], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to add medicine' });
        res.json({ success: true, message: 'Medicine added successfully!', id: result.insertId });
    });
});

const { sendSms } = require('./sms.cjs');

// PUT to update a medicine
router.put('/medicines/:id', (req, res) => {
    const { id } = req.params;
    const { name, categoryId, description, dosageForm, strength, unitPrice, stockQuantity, reorderLevel } = req.body;
    const sql = 'UPDATE pharmaceuticals SET name = ?, categoryId = ?, description = ?, dosageForm = ?, strength = ?, unitPrice = ?, stockQuantity = ?, reorderLevel = ? WHERE id = ?';
    executeQuery(sql, [name, categoryId, description, dosageForm, strength, unitPrice, stockQuantity, reorderLevel, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to update medicine' });

        if (stockQuantity <= reorderLevel) {
            const message = `Low stock alert:\nMedicine: ${name} (${strength})\nCategory: ${categoryId}\nCurrent Stock: ${stockQuantity}\nReorder Level: ${reorderLevel}`;
            // In a real app, you would get the pharmacist's phone number from the database
            const pharmacistPhone = process.env.PHARMACIST_PHONE_NUMBER; 
            if (pharmacistPhone) {
                sendSms(pharmacistPhone, message)
                    .then(smsResult => console.log('Low stock SMS sent:', smsResult.sid))
                    .catch(smsError => console.error('Failed to send low stock SMS:', smsError));
            }
        }

        res.json({ success: true, message: 'Medicine updated successfully!' });
    });
});

// DELETE a medicine
router.delete('/medicines/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM pharmaceuticals WHERE id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete medicine' });
        res.json({ success: true, message: 'Medicine deleted successfully!' });
    });
});

module.exports = router;
