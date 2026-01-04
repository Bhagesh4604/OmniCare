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

const { medicareChain, Block } = require('./blockchainService.cjs');

// POST: Add a new batch of medicine (Blockchain + DB)
router.post('/batch/add', (req, res) => {
    const { medicineId, batchNumber, manufacturer, expiryDate, quantity } = req.body;

    if (!medicineId || !batchNumber || !quantity) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // 1. Update Inventory in MySQL
    const sql = 'UPDATE pharmaceuticals SET stockQuantity = stockQuantity + ? WHERE id = ?';
    executeQuery(sql, [quantity, medicineId], (err, result) => {
        if (err) {
            console.error("DB Inventory Update Failed:", err);
            return res.status(500).json({ success: false, message: 'Database error updating stock' });
        }

        // 2. Add to Blockchain Ledger
        try {
            const blockData = {
                event: "BATCH_CREATED",
                medicineId,
                batchNumber,
                manufacturer: manufacturer || "Unknown",
                expiryDate,
                quantity,
                price: req.body.price || "N/A", // Added Price
                timestamp: Date.now()
            };

            const newBlock = new Block(
                medicareChain.chain.length,
                Date.now(),
                blockData
            );

            medicareChain.addBlock(newBlock);

            res.json({
                success: true,
                message: 'Batch added to Inventory & Blockchain Ledger',
                blockIndex: newBlock.index,
                blockHash: newBlock.hash
            });
        } catch (chainErr) {
            console.error("Blockchain Error:", chainErr);
            res.status(500).json({ success: false, message: 'Blockchain Ledger Error' });
        }
    });
});

// Helper to get Govt Price from DB
function getGovtPrice(medicineId) {
    return new Promise((resolve) => {
        const sql = 'SELECT maxPrice FROM government_prices WHERE medicineId = ?';
        executeQuery(sql, [medicineId], (err, results) => {
            if (err) {
                console.error("Error fetching govt price:", err);
                return resolve(50.00); // Fallback
            }
            if (results && results.length > 0) {
                return resolve(parseFloat(results[0].maxPrice));
            }
            return resolve(100.00); // Default standard
        });
    });
}

// GET: Verify Batch History (Public/Patient Access)
router.get('/batch/verify/:batchNumber', async (req, res) => {
    const { batchNumber } = req.params;

    // Filter the in-memory chain for blocks related to this batch
    const history = medicareChain.chain
        .filter(block => {
            let data = block.data;
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch (e) { return false; }
            }
            return data && data.batchNumber === batchNumber;
        })
        .map(block => ({
            index: block.index,
            timestamp: new Date(block.timestamp).toISOString(),
            event: block.data.event || "UNKNOWN",
            details: block.data,
            hash: block.hash,
            isGenesis: block.index === 0
        }));

    if (history.length === 0) {
        return res.json({ success: false, message: 'Batch not found in Ledger' });
    }

    // Enhance response with Govt Market Data
    const latestBlock = history[history.length - 1];
    const medicineId = latestBlock.details.medicineId;

    // FETCH REAL PRICE FROM DATABASE
    const govtPrice = await getGovtPrice(medicineId);

    res.json({
        success: true,
        isVerified: true,
        verificationMsg: "✅ Verified by OmniCare Ledger",
        marketData: {
            govtPrice: govtPrice,
            isFairPrice: Number(latestBlock.details.price) <= govtPrice,
            avgSaving: Number(latestBlock.details.price) < govtPrice ? (govtPrice - Number(latestBlock.details.price)).toFixed(2) : 0
        },
        history
    });
});

module.exports = router;