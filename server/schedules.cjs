const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

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
    const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();

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

            const bookedTimes = appointmentResults.map(a => new Date(a.appointmentDate).getTime());
            
            const availableSlots = [];
            const slotDuration = 30 * 60 * 1000; // 30 minutes

            let currentTime = new Date(`${date}T${startTime}`);
            const endTimeDate = new Date(`${date}T${endTime}`);

            while (currentTime < endTimeDate) {
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
