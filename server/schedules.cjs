const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');
const { fromZonedTime, toZonedTime, format } = require('date-fns-tz');

// Get a doctor's schedule
router.get('/:doctorId', (req, res) => {
    const { doctorId } = req.params;
    const sql = 'SELECT * FROM doctor_schedules WHERE doctorId = ? ORDER BY dayOfWeek ASC';
    executeQuery(sql, [doctorId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json(results);
    });
});

// Update a doctor's schedule
router.post('/', (req, res) => {
    console.log('--- Save Schedule Request ---');
    console.log('Request Body:', req.body);

    const { doctorId, schedules } = req.body; // schedules is an array of { dayOfWeek, startTime, endTime }

    if (!doctorId || !Array.isArray(schedules)) {
        console.error('Validation failed: doctorId or schedules missing.');
        return res.status(400).json({ success: false, message: 'Doctor ID and schedules array are required.' });
    }

    const deleteSql = 'DELETE FROM doctor_schedules WHERE doctorId = ?';
    executeQuery(deleteSql, [doctorId], (err, result) => {
        if (err) {
            console.error('DB Error on DELETE:', err);
            return res.status(500).json({ success: false, message: 'Failed to clear old schedule.' });
        }

        console.log('Old schedule deleted.');

        if (schedules.length === 0) {
            console.log('No new schedules to insert.');
            return res.json({ success: true, message: 'Schedule cleared successfully.' });
        }

        const insertSql = 'INSERT INTO doctor_schedules (doctorId, dayOfWeek, startTime, endTime) VALUES ?';
        const values = schedules.map(s => [doctorId, s.dayOfWeek, s.startTime, s.endTime]);
        console.log('Values to INSERT:', values);

        executeQuery(insertSql, [values], (err, result) => {
            if (err) {
                console.error('DB Error on INSERT:', err);
                return res.status(500).json({ success: false, message: 'Failed to save new schedule.' });
            }
            console.log('New schedule inserted.');
            res.json({ success: true, message: 'Schedule updated successfully!' });
        });
    });
});

// Get available appointment slots for a doctor on a specific date
router.get('/available-slots/:doctorId/:date', (req, res) => {
    const { doctorId, date } = req.params; // date is in YYYY-MM-DD format
    const timeZone = 'Asia/Kolkata'; // Assuming doctor's timezone is IST
    const dayOfWeek = new Date(date).getUTCDay();

    const scheduleSql = 'SELECT startTime, endTime FROM doctor_schedules WHERE doctorId = ? AND dayOfWeek = ?';

    executeQuery(scheduleSql, [doctorId, dayOfWeek], (err, scheduleResults) => {
        if (err) return res.status(500).json({ success: false, message: 'DB error fetching schedule.' });
        if (scheduleResults.length === 0) {
            return res.json([]); // Doctor is not available on this day
        }

        const { startTime, endTime } = scheduleResults[0];

        const appointmentsSql = 'SELECT appointmentDate FROM appointments WHERE doctorId = ? AND appointmentDate >= ? AND appointmentDate < DATE_ADD(?, INTERVAL 1 DAY)';
        executeQuery(appointmentsSql, [doctorId, date, date], (err, appointmentResults) => {
            if (err) return res.status(500).json({ success: false, message: 'DB error fetching appointments.' });

            const bookedTimes = appointmentResults.map(a => toZonedTime(new Date(a.appointmentDate), timeZone).getTime());

            const availableSlots = [];
            const slotDuration = 30 * 60 * 1000; // 30 minutes

            const startDateTime = fromZonedTime(`${date}T${startTime}`, timeZone);
            const endDateTime = fromZonedTime(`${date}T${endTime}`, timeZone);

            let currentTime = startDateTime;

            while (currentTime < endDateTime) {
                if (!bookedTimes.includes(currentTime.getTime())) {
                    availableSlots.push(currentTime.toISOString());
                }
                currentTime.setTime(currentTime.getTime() + slotDuration);
            }

            res.json(availableSlots);
        });
    });
});

module.exports = router;
