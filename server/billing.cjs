const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// Helper to generate a unique bill number
const generateBillNumber = () => {
    return `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// GET all bills
router.get('/', (req, res) => {
    const sql = `SELECT pb.*, CONCAT(p.firstName, ' ', p.lastName) as patientName FROM patient_bills pb JOIN patients p ON pb.patientId = p.id ORDER BY pb.billDate DESC`;
    executeQuery(sql, [], (err, results) => {
        if (err) {
            console.error('Error fetching all bills:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        res.json(results);
    });
});

// GET all bills for a specific patient
router.get('/patient/:patientId', (req, res) => {
    const { patientId } = req.params;
    const sql = 'SELECT * FROM patient_bills WHERE patientId = ? ORDER BY billDate DESC';
    executeQuery(sql, [patientId], (err, results) => {
        if (err) {
            console.error('Error fetching patient bills:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        res.json(results);
    });
});

// GET details of a specific bill (including items)
router.get('/:billId/details', async (req, res) => {
    const { billId } = req.params;

    try {
        const bill = await new Promise((resolve, reject) => {
            executeQuery('SELECT * FROM patient_bills WHERE id = ?', [billId], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });

        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found.' });
        }

        const items = await new Promise((resolve, reject) => {
            executeQuery('SELECT * FROM bill_items WHERE billId = ?', [billId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        res.json({ success: true, bill: { ...bill, items } });

    } catch (error) {
        console.error('Error fetching bill details:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// POST: Generate a new bill
router.post('/generate', async (req, res) => {
    const { patientId, dueDate, items, notes } = req.body;

    if (!patientId || !dueDate || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Patient ID, due date, and at least one item are required.' });
    }

    const billNumber = generateBillNumber();
    const billDate = new Date();
    let totalAmount = 0;
    items.forEach(item => { totalAmount += parseFloat(item.amount); });
    const balanceDue = totalAmount;

    try {
        const insertBillSql = 'INSERT INTO patient_bills (billNumber, patientId, billDate, dueDate, totalAmount, amountPaid, balanceDue, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const billResult = await new Promise((resolve, reject) => {
            executeQuery(insertBillSql, [billNumber, patientId, billDate, dueDate, totalAmount, 0, balanceDue, 'pending', notes || null], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const billId = billResult.insertId;

        for (const item of items) {
            const insertItemSql = 'INSERT INTO bill_items (billId, description, amount, serviceReference) VALUES (?, ?, ?, ?)';
            await new Promise((resolve, reject) => {
                executeQuery(insertItemSql, [billId, item.description, item.amount, item.serviceReference || null], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        }

        res.json({ success: true, message: 'Bill generated successfully!', billId, billNumber });

    } catch (error) {
        console.error('Error generating bill:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// PUT: Record a payment for a bill
router.put('/:billId/pay', async (req, res) => {
    const { billId } = req.params;
    const { paymentAmount, paymentMethod, notes } = req.body;

    if (!paymentAmount || paymentAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Valid payment amount is required.' });
    }

    try {
        const bill = await new Promise((resolve, reject) => {
            executeQuery('SELECT totalAmount, amountPaid, balanceDue FROM patient_bills WHERE id = ?', [billId], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });

        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found.' });
        }

        let newAmountPaid = parseFloat(bill.amountPaid) + parseFloat(paymentAmount);
        let newBalanceDue = parseFloat(bill.totalAmount) - newAmountPaid;
        let status = 'partial';
        if (newBalanceDue <= 0) {
            status = 'paid';
            newBalanceDue = 0; // Ensure no negative balance
        }

        const updateBillSql = 'UPDATE patient_bills SET amountPaid = ?, balanceDue = ?, status = ? WHERE id = ?';
        await new Promise((resolve, reject) => {
            executeQuery(updateBillSql, [newAmountPaid, newBalanceDue, status, billId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // Optionally, insert into a payments table if we had one
        // For now, just update the bill

        res.json({ success: true, message: 'Payment recorded successfully!', newBalanceDue, status });

    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// PUT: Update bill details (e.g., due date, notes, status manually)
router.put('/:billId', (req, res) => {
    const { billId } = req.params;
    const { dueDate, status, notes } = req.body;

    const sql = 'UPDATE patient_bills SET dueDate = ?, status = ?, notes = ? WHERE id = ?';
    executeQuery(sql, [dueDate, status, notes, billId], (err, result) => {
        if (err) {
            console.error('Error updating bill:', err);
            return res.status(500).json({ success: false, message: 'Failed to update bill' });
        }
        res.json({ success: true, message: 'Bill updated successfully!' });
    });
});

// DELETE a bill
router.delete('/:billId', (req, res) => {
    const { billId } = req.params;
    const sql = 'DELETE FROM patient_bills WHERE id = ?';
    executeQuery(sql, [billId], (err, result) => {
        if (err) {
            console.error('Error deleting bill:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete bill' });
        }
        res.json({ success: true, message: 'Bill deleted successfully!' });
    });
});

module.exports = router;
