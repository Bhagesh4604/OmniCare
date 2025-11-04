const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET all payroll records
router.get('/', (req, res) => {
    const sql = `
        SELECT pr.*, e.firstName, e.lastName, e.salary as basicSalary
        FROM payroll_records pr
        JOIN employees e ON pr.employeeId = e.id
        ORDER BY pr.payPeriodEnd DESC
    `;
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'DB Error', error: err });
        res.json(results);
    });
});

// POST a new payroll record
router.post('/add', (req, res) => {
    const { employeeId, payPeriodStart, payPeriodEnd } = req.body;
    const sql = `INSERT INTO payroll_records (employeeId, payPeriodStart, payPeriodEnd, status) VALUES (?, ?, ?, 'pending')`;
    const params = [employeeId, payPeriodStart, payPeriodEnd];
    executeQuery(sql, params, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'DB Error', error: err });
        res.json({ success: true, message: 'Payroll generated successfully!' });
    });
});

// PUT (update) a payroll status
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const sql = 'UPDATE payroll_records SET status = ?, paymentDate = ? WHERE id = ?';
    // Set payment date only if status is 'paid'
    const paymentDate = status === 'paid' ? new Date() : null;
    executeQuery(sql, [status, paymentDate, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to update payroll status' });
        res.json({ success: true, message: 'Payroll status updated!' });
    });
});

// DELETE a payroll record
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM payroll_records WHERE id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete payroll record' });
        res.json({ success: true, message: 'Payroll record deleted successfully!' });
    });
});


module.exports = router;