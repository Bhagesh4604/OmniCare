const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET all vendors
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM vendors ORDER BY vendorName ASC';
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'DB Error' });
        res.json(results);
    });
});

// POST a new vendor
router.post('/add', (req, res) => {
    const { vendorName, contactPerson, email, phone, address, vendorType } = req.body;
    const sql = 'INSERT INTO vendors (vendorName, contactPerson, email, phone, address, vendorType, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [vendorName, contactPerson, email, phone, address, vendorType, 'active'];
    executeQuery(sql, params, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'DB Error' });
        res.json({ success: true, message: 'Vendor added successfully!' });
    });
});

// PUT (update) a vendor
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { vendorName, contactPerson, email, phone, address, vendorType, status } = req.body;
    const sql = 'UPDATE vendors SET vendorName = ?, contactPerson = ?, email = ?, phone = ?, address = ?, vendorType = ?, status = ? WHERE id = ?';
    const params = [vendorName, contactPerson, email, phone, address, vendorType, status, id];
    executeQuery(sql, params, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to update vendor' });
        res.json({ success: true, message: 'Vendor updated successfully!' });
    });
});

// DELETE a vendor
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM vendors WHERE id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete vendor' });
        res.json({ success: true, message: 'Vendor deleted successfully!' });
    });
});


module.exports = router;