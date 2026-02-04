const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');
const { sendSms } = require('./sms.cjs');

const generateRoomUrl = (appointmentId) => {
    const roomName = `HMSConsultation-${appointmentId}-${Date.now()}`;
    return `https://meet.jit.si/${roomName}`;
};

router.get('/appointment/:appointmentId', (req, res) => {
    const { appointmentId } = req.params;
    const sql = 'SELECT * FROM virtual_consultation_rooms WHERE appointmentId = ?';
    executeQuery(sql, [appointmentId], (err, results) => {
        if (err) {
            console.error('Error fetching virtual room:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Virtual room not found for this appointment.' });
        }
        res.json({ success: true, room: results[0] });
    });
});

router.post('/create', async (req, res) => {
    const { appointmentId, startTime, endTime } = req.body;

    if (!appointmentId || !startTime || !endTime) {
        return res.status(400).json({ success: false, message: 'Appointment ID, start time, and end time are required.' });
    }

    try {
        const roomUrl = generateRoomUrl(appointmentId);

        const insertSql = 'INSERT INTO virtual_consultation_rooms (appointmentId, roomUrl, startTime, endTime, status) VALUES (?, ?, ?, ?, ?)';
        await new Promise((resolve, reject) => {
            executeQuery(insertSql, [appointmentId, roomUrl, startTime, endTime, 'scheduled'], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({ success: true, message: 'Virtual room created successfully!', roomUrl });

    } catch (error) {
        console.error('Error creating virtual room:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.put('/:roomId/status', (req, res) => {
    const { roomId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const sql = 'UPDATE virtual_consultation_rooms SET status = ? WHERE id = ?';
    executeQuery(sql, [status, roomId], (err, result) => {
        if (err) {
            console.error('Error updating virtual room status:', err);
            return res.status(500).json({ success: false, message: 'Failed to update virtual room status' });
        }
        res.json({ success: true, message: 'Virtual room status updated successfully!' });
    });
});

module.exports = router;