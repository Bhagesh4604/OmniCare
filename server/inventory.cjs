const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET all pharmaceuticals for inventory view
router.get('/pharmaceuticals', (req, res) => {
    const sql = `
        SELECT p.*, pc.name as categoryName 
        FROM pharmaceuticals p 
        LEFT JOIN pharmaceutical_categories pc ON p.categoryId = pc.id 
        ORDER BY p.name ASC`;
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'DB Error' });
        res.json(results);
    });
});

// GET all medical equipment
router.get('/equipment', (req, res) => {
    const sql = 'SELECT * FROM medical_equipment ORDER BY name ASC';
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'DB Error' });
        res.json(results);
    });
});

// POST a new piece of medical equipment
router.post('/equipment/add', (req, res) => {
    const { name, quantity, status } = req.body;
    const sql = 'INSERT INTO medical_equipment (name, quantity, status) VALUES (?, ?, ?)';
    executeQuery(sql, [name, quantity, status], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to add equipment' });
        res.json({ success: true, message: 'Equipment added successfully!' });
    });
});

// PUT (update) medical equipment
router.put('/equipment/:id', (req, res) => {
    const { id } = req.params;
    const { name, quantity, status } = req.body;
    const sql = 'UPDATE medical_equipment SET name = ?, quantity = ?, status = ? WHERE id = ?';
    executeQuery(sql, [name, quantity, status, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to update equipment' });
        res.json({ success: true, message: 'Equipment updated successfully!' });
    });
});

// PUT (update) pharmaceutical stock
router.put('/pharmaceuticals/:id', (req, res) => {
    const { id } = req.params;
    const { stockQuantity } = req.body;
    const sql = 'UPDATE pharmaceuticals SET stockQuantity = ? WHERE id = ?';
    executeQuery(sql, [stockQuantity, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to update stock' });
        res.json({ success: true, message: 'Stock updated successfully!' });
    });
});

// DELETE medical equipment
router.delete('/equipment/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM medical_equipment WHERE id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete equipment' });
        res.json({ success: true, message: 'Equipment deleted successfully!' });
    });
});

module.exports = router;