const express = require('express');
const router = express.Router();
console.log("✅ beds.cjs router is being loaded."); // ADDED
const { executeQuery } = require('./db.cjs');
const WebSocket = require('ws');

// Helper function to broadcast updates to all WebSocket clients
const broadcastUpdate = (wss) => {
    if (!wss) return;
    const message = JSON.stringify({ type: 'beds-updated' });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

// GET all wards with their beds and patient info
router.get('/', (req, res) => {
    const wardsSql = 'SELECT * FROM wards ORDER BY name ASC';
    executeQuery(wardsSql, [], (err, wards) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to fetch wards' });

        const bedPromises = wards.map(ward => {
            return new Promise((resolve, reject) => {
                const bedsSql = `
                    SELECT b.*, p.firstName, p.lastName 
                    FROM beds b 
                    LEFT JOIN patients p ON b.patientId = p.id 
                    WHERE b.wardId = ? 
                    ORDER BY b.bedNumber ASC
                `;
                executeQuery(bedsSql, [ward.id], (err, beds) => {
                    if (err) return reject(err);
                    ward.beds = beds;
                    resolve(ward);
                });
            });
        });

        Promise.all(bedPromises)
            .then(results => {
                res.json(results);
            })
            .catch(err => {
                res.status(500).json({ success: false, message: 'Failed to fetch bed data' });
            });
    });
});

// PUT to assign a patient to a bed
router.put('/assign', async (req, res) => { // Made async
    const { bedId, patientId } = req.body;
    if (!bedId || !patientId) {
        return res.status(400).json({ success: false, message: 'Bed ID and Patient ID are required.' });
    }

    try {
        // 1. Update bed status
        const updateBedSql = "UPDATE beds SET status = 'occupied', patientId = ? WHERE id = ? AND status = 'available'";
        const bedUpdateResult = await new Promise((resolve, reject) => {
            executeQuery(updateBedSql, [patientId, bedId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (bedUpdateResult.affectedRows === 0) {
            return res.status(409).json({ success: false, message: 'Bed is not available or does not exist.' });
        }

        // 2. Get wardId for the bed
        const getBedInfoSql = "SELECT wardId FROM beds WHERE id = ?";
        const bedInfo = await new Promise((resolve, reject) => {
            executeQuery(getBedInfoSql, [bedId], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });

        if (!bedInfo) {
            return res.status(404).json({ success: false, message: 'Bed not found.' });
        }
        const { wardId } = bedInfo;

        // 3. Insert into admissions table
        const admissionSql = "INSERT INTO admissions (patientId, admissionDate, wardId, bedId, notes) VALUES (?, NOW(), ?, ?, ?)";
        await new Promise((resolve, reject) => {
            executeQuery(admissionSql, [patientId, wardId, bedId, 'Assigned to bed'], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        broadcastUpdate(req.app.get('wss')); // Broadcast the update
        res.json({ success: true, message: 'Patient assigned to bed and admitted successfully!' });

    } catch (error) {
        console.error("Error during patient assignment/admission:", error);
        res.status(500).json({ success: false, message: 'Database error during assignment/admission.' });
    }
});

// PUT to unassign a patient from a bed (discharge/clear bed)
router.put('/unassign', async (req, res) => { // Made async
    const { bedId, newStatus = 'available' } = req.body;
    if (!bedId) {
        return res.status(400).json({ success: false, message: 'Bed ID is required.' });
    }

    try {
        // 1. Get patientId from the bed before unassigning
        const getPatientIdSql = "SELECT patientId FROM beds WHERE id = ?";
        const bedInfo = await new Promise((resolve, reject) => {
            executeQuery(getPatientIdSql, [bedId], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });

        const patientId = bedInfo ? bedInfo.patientId : null;

        // 2. Update bed status
        const updateBedSql = "UPDATE beds SET status = ?, patientId = NULL WHERE id = ?";
        await new Promise((resolve, reject) => {
            executeQuery(updateBedSql, [newStatus, bedId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // 3. If a patient was unassigned, update their admission record
        if (patientId) {
            const updateAdmissionSql = "UPDATE admissions SET dischargeDate = NOW() WHERE patientId = ? AND bedId = ? AND dischargeDate IS NULL ORDER BY admissionDate DESC LIMIT 1";
            await new Promise((resolve, reject) => {
                executeQuery(updateAdmissionSql, [patientId, bedId], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        }

        broadcastUpdate(req.app.get('wss')); // Broadcast the update
        res.json({ success: true, message: 'Bed cleared and patient discharged successfully!' });

    } catch (error) {
        console.error("Error during patient unassignment/discharge:", error);
        res.status(500).json({ success: false, message: 'Database error during unassignment/discharge.' });
    }
});

// PUT to update only the status of a bed
router.put('/status', (req, res) => {
    console.log("✅ PUT /api/beds/status endpoint was hit.");
    const { bedId, newStatus } = req.body;
    if (!bedId || !newStatus) {
        return res.status(400).json({ success: false, message: 'Bed ID and new status are required.' });
    }

    const sql = "UPDATE beds SET status = ? WHERE id = ?";
    executeQuery(sql, [newStatus, bedId], (err, result) => {
        if (err) {
            console.error("Database error on status update:", err);
            return res.status(500).json({ success: false, message: `Database error during status update: ${err.message}` });
        }
        
        broadcastUpdate(req.app.get('wss')); // Broadcast the update
        res.json({ success: true, message: 'Bed status updated successfully!' });
    });
});

module.exports = router;