const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET all accounts payable
router.get('/payable', (req, res) => {
  const sql = 'SELECT * FROM accounts_payable ORDER BY dueDate ASC';
  executeQuery(sql, [], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
    res.json(results);
  });
});

// GET all accounts receivable
router.get('/receivable', (req, res) => {
    const sql = `
        SELECT ar.*, CONCAT(p.firstName, ' ', p.lastName) as patientName 
        FROM accounts_receivable ar
        JOIN patients p ON ar.patientId = p.id
        ORDER BY ar.dueDate ASC
    `;
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// POST a new entry
router.post('/add', (req, res) => {
    const { type, invoiceNumber, name, amount, dueDate, patientId } = req.body;
    let sql, params;
    if (type === 'payable') {
        sql = 'INSERT INTO accounts_payable (invoiceNumber, vendorName, amount, dueDate, paymentStatus) VALUES (?, ?, ?, ?, ?)';
        params = [invoiceNumber, name, amount, dueDate, 'pending'];
    } else {
        sql = 'INSERT INTO accounts_receivable (invoiceNumber, patientId, amount, dueDate, paymentStatus) VALUES (?, ?, ?, ?, ?)';
        params = [invoiceNumber, patientId, amount, dueDate, 'pending'];
    }
    executeQuery(sql, params, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to add entry' });
        res.json({ success: true, message: 'Entry added successfully!' });
    });
});

// PUT (update) an entry's status
router.put('/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const { paymentStatus } = req.body;
    const table = type === 'payable' ? 'accounts_payable' : 'accounts_receivable';
    
    const sql = `UPDATE ${table} SET paymentStatus = ? WHERE id = ?`;
    executeQuery(sql, [paymentStatus, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to update status' });
        res.json({ success: true, message: 'Status updated successfully!' });
    });
});

// DELETE an entry
router.delete('/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const table = type === 'payable' ? 'accounts_payable' : 'accounts_receivable';

    const sql = `DELETE FROM ${table} WHERE id = ?`;
    executeQuery(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete entry' });
        res.json({ success: true, message: 'Entry deleted successfully!' });
    });
});

module.exports = router;