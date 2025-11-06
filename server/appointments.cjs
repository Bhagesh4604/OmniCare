const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');
const { sendSms } = require('./sms.cjs');

// GET all appointments (for Admin)
router.get('/all', (req, res) => {
    const sql = `
        SELECT a.id, a.appointmentDate, a.status, a.notes, a.consultationType,
               CONCAT(p.firstName, ' ', p.lastName) as patientName,
               p.patientId as patientId,
               CONCAT(e.firstName, ' ', e.lastName) as doctorName,
               d.name as departmentName
        FROM appointments a
        JOIN patients p ON a.patientId = p.id
        JOIN employees e ON a.doctorId = e.id
        LEFT JOIN departments d ON e.departmentId = d.id
        ORDER BY a.appointmentDate DESC
    `;
    executeQuery(sql, [], (err, results) => {
        if (err) {
            console.error("Error fetching all appointments:", err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        res.json(results);
    });
});

// GET all appointments for a specific doctor
router.get('/doctor/:doctorId', (req, res) => {
    const { doctorId } = req.params;
    const sql = `
        SELECT a.id, a.appointmentDate, a.status, a.notes, a.consultationType,
               CONCAT(p.firstName, ' ', p.lastName) as patientName,
               p.patientId as patientId,
               d.name as departmentName
        FROM appointments a
        JOIN patients p ON a.patientId = p.id
        JOIN employees e ON a.doctorId = e.id
        LEFT JOIN departments d ON e.departmentId = d.id
        WHERE a.doctorId = ?
        ORDER BY a.appointmentDate DESC
    `;
    executeQuery(sql, [doctorId], (err, results) => {
        if (err) {
            console.error("Error fetching doctor appointments:", err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        res.json(results);
    });
});

// GET virtual appointments for a specific doctor
router.get('/doctor/:doctorId/virtual', async (req, res) => {
    const { doctorId } = req.params;
    try {
        const sql = `
            SELECT a.id, a.appointmentDate, a.status, a.notes, a.consultationType,
                   CONCAT(p.firstName, ' ', p.lastName) as patientName,
                   p.patientId as patientId,
                   vcr.roomUrl
            FROM appointments a
            JOIN patients p ON a.patientId = p.id
            LEFT JOIN virtual_consultation_rooms vcr ON a.id = vcr.appointmentId
            WHERE a.doctorId = ? AND a.consultationType = 'virtual'
            ORDER BY a.appointmentDate DESC
        `;
        const results = await new Promise((resolve, reject) => {
            executeQuery(sql, [doctorId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        res.json(results);
    } catch (error) {
        console.error("Error fetching virtual doctor appointments:", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET today's appointments for the dashboard agenda
router.get('/today', (req, res) => {
    const sql = `
        SELECT a.id, a.appointmentDate, a.status, a.notes,
               CONCAT(p.firstName, ' ', p.lastName) as patientName
        FROM appointments a
        JOIN patients p ON a.patientId = p.id
        WHERE DATE(a.appointmentDate) = CURDATE()
        ORDER BY a.appointmentDate ASC
    `;
    executeQuery(sql, [], (err, results) => {
        if (err) {
            console.error("Error fetching today's appointments:", err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        res.json(results);
    });
});

const generateRoomUrl = (appointmentId) => {
    const roomName = `HMSConsultation-${appointmentId}-${Date.now()}`;
    return `https://meet.jit.si/${roomName}`;
};

router.post('/book-by-doctor', async (req, res) => {
    const { patientId, doctorId, appointmentDate, notes, consultationType } = req.body;

    console.log('Received request to book appointment:', { patientId, doctorId, appointmentDate, notes, consultationType });

    if (!patientId || !doctorId || !appointmentDate) {
        return res.status(400).json({ success: false, message: 'Patient, doctor, and date are required.' });
    }

    if (new Date(appointmentDate) < new Date()) {
        return res.status(400).json({ success: false, message: 'Cannot book an appointment in the past.' });
    }

    try {
        console.log('Formatting appointment date...');
        const formattedAppointmentDate = new Date(appointmentDate).toISOString().slice(0, 19).replace('T', ' ');
        console.log('Formatted appointment date:', formattedAppointmentDate);

        console.log('Inserting appointment into database...');
        const result = await new Promise((resolve, reject) => {
            const sql = "INSERT INTO appointments (patientId, doctorId, appointmentDate, notes, status, consultationType) VALUES (?, ?, ?, ?, 'scheduled', ?)";
            executeQuery(sql, [patientId, doctorId, formattedAppointmentDate, notes, consultationType], (err, result) => {
                if (err) {
                    console.error('Error inserting appointment:', err);
                    return reject(err);
                }
                console.log('Appointment inserted successfully, ID:', result.insertId);
                resolve(result);
            });
        });

        const appointmentId = result.insertId;

        console.log('Fetching patient and doctor details...');
        const details = await new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    p.phone, 
                    p.firstName as patientFirstName,
                    CONCAT(e.firstName, ' ', e.lastName) as doctorName
                FROM appointments a
                JOIN patients p ON a.patientId = p.id
                JOIN employees e ON a.doctorId = e.id
                WHERE a.id = ?
            `;
            executeQuery(sql, [appointmentId], (err, results) => {
                if (err) {
                    console.error('Error fetching patient and doctor details:', err);
                    return reject(err);
                }
                if (results.length === 0) {
                    console.error('Could not find details for appointment ID:', appointmentId);
                    return reject(new Error('Could not find appointment details.'));
                }
                console.log('Patient and doctor details fetched successfully:', results[0]);
                resolve(results[0]);
            });
        });

        if (details && details.phone) {
            const apptDate = new Date(appointmentDate);
            const formattedDate = apptDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const formattedTime = apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            let message = `Hi ${details.patientFirstName}, your appointment with Dr. ${details.doctorName} is confirmed for ${formattedDate} at ${formattedTime}.`;

            if (consultationType === 'virtual') {
                console.log('Virtual consultation, generating room URL...');
                const roomUrl = generateRoomUrl(appointmentId);
                console.log('Generated room URL:', roomUrl);

                const startTime = new Date(appointmentDate).toISOString();
                const endTime = new Date(new Date(appointmentDate).getTime() + 30 * 60 * 1000).toISOString(); // 30 min duration

                console.log('Inserting virtual consultation room into database...');
                await new Promise((resolve, reject) => {
                    const insertSql = 'INSERT INTO virtual_consultation_rooms (appointmentId, roomUrl, startTime, endTime, status) VALUES (?, ?, ?, ?, ?)';
                    executeQuery(insertSql, [appointmentId, roomUrl, startTime, endTime, 'scheduled'], (err, result) => {
                        if (err) {
                            console.error('Error inserting virtual consultation room:', err);
                            return reject(err);
                        }
                        console.log('Virtual consultation room inserted successfully.');
                        resolve(result);
                    });
                });

                message += ` Join here: ${roomUrl}`;
            }

            console.log('Sending SMS...');
            await sendSms(details.phone, message);
            console.log(`SMS notification sent to ${details.phone}`);
        } else {
            console.error(`Could not find details for appointment ID ${appointmentId} to send SMS.`);
        }

        res.status(201).json({ success: true, message: 'Appointment booked successfully!', id: appointmentId });

    } catch (err) {
        console.error("Error booking appointment by doctor:", err);
        res.status(500).json({ success: false, message: 'Database error while booking appointment.' });
    }
});


module.exports = router;