const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');
const { sendSms } = require('./sms.cjs'); // Import the reusable SMS function

// Helper to generate a unique room URL (for Jitsi Meet for example)
const generateRoomUrl = (appointmentId) => {
    const roomName = `HMSConsultation-${appointmentId}-${Date.now()}`;
    return `https://meet.jit.si/${roomName}`;
};

// GET virtual consultation room details for a specific appointment
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

// POST: Create a new virtual consultation room (linked to an appointment)
router.post('/create', async (req, res) => {
    const { appointmentId, startTime, endTime } = req.body;

    if (!appointmentId || !startTime || !endTime) {
        return res.status(400).json({ success: false, message: 'Appointment ID, start time, and end time are required.' });
    }

    try {
        // Get doctor's name from appointment
        const appointmentSql = 'SELECT e.firstName, e.lastName FROM appointments a JOIN employees e ON a.doctorId = e.id WHERE a.id = ?';
        executeQuery(appointmentSql, [appointmentId], async (err, results) => {
            if (err || results.length === 0) {
                return res.status(500).json({ success: false, message: 'Could not retrieve doctor details for the appointment.' });
            }

            const doctorName = `${results[0].firstName}${results[0].lastName}`.replace(/\s/g, '_');
            const roomUrl = `https://meet.jit.si/ShreeMedicare-${doctorName}-${appointmentId}`;

            const insertSql = 'INSERT INTO virtual_consultation_rooms (appointmentId, roomUrl, startTime, endTime, status) VALUES (?, ?, ?, ?, ?)';
            await new Promise((resolve, reject) => {
                executeQuery(insertSql, [appointmentId, roomUrl, startTime, endTime, 'scheduled'], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            // --- NEW: Send SMS to Patient ---
            try {
                // 1. Get Patient and Appointment Details from Appointment ID
                const appointmentDetails = await new Promise((resolve, reject) => {
                    const sql = `
                        SELECT 
                            p.phone, 
                            p.firstName as patientFirstName,
                            a.appointmentDate,
                            CONCAT(e.firstName, ' ', e.lastName) as doctorName
                        FROM appointments a
                        JOIN patients p ON a.patientId = p.id
                        JOIN employees e ON a.doctorId = e.id
                        WHERE a.id = ?
                    `;
                    executeQuery(sql, [appointmentId], (err, results) => {
                        if (err) return reject(err);
                        resolve(results[0]);
                    });
                });

                if (appointmentDetails && appointmentDetails.phone) {
                    // 2. Format date and time
                    const apptDate = new Date(appointmentDetails.appointmentDate);
                    const formattedDate = apptDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    const formattedTime = apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                    // 3. Craft and send the message
                    const message = `Hi ${appointmentDetails.patientFirstName}, your virtual consultation with Dr. ${appointmentDetails.doctorName} is scheduled for ${formattedDate} at ${formattedTime}. Join here: ${roomUrl}`;
                    await sendSms(appointmentDetails.phone, message);
                    console.log(`SMS notification sent to ${appointmentDetails.phone}`);
                } else {
                    console.error(`Could not find details for appointment ID ${appointmentId} to send SMS.`);
                }
            } catch (smsError) {
                // Log the error, but don't fail the whole request just because SMS failed
                console.error('Failed to send SMS notification:', smsError);
            }
            // --- END NEW ---

            res.json({ success: true, message: 'Virtual room created successfully!', roomUrl });
        });

    } catch (error) {
        console.error('Error creating virtual room:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// PUT: Update virtual consultation room status (e.g., active, completed)
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
