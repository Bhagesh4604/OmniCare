const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

router.get('/summary', async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const queries = {
        admissionsLast7Days: `
            SELECT DATE(admissionDate) as date, COUNT(id) as count
            FROM admissions
            WHERE admissionDate >= ?
            GROUP BY DATE(admissionDate)
            ORDER BY date ASC;
        `,
        appointmentsLast7Days: `
            SELECT DATE(appointmentDate) as date, COUNT(id) as count
            FROM appointments
            WHERE appointmentDate >= ?
            GROUP BY DATE(appointmentDate)
            ORDER BY date ASC;
        `,
        newPatientsToday: `SELECT COUNT(id) as count FROM admissions WHERE DATE(admissionDate) = ?`,
        appointmentsToday: `SELECT COUNT(id) as count FROM appointments WHERE DATE(appointmentDate) = ?`,
        bedOccupancy: `SELECT SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied, COUNT(id) as total FROM beds`,
        totalRevenue: `
            SELECT SUM(total) as total FROM (
                SELECT COALESCE(SUM(amount), 0) as total FROM accounts_receivable WHERE paymentStatus = 'paid'
                UNION ALL
                SELECT COALESCE(SUM(totalAmount), 0) as total FROM patient_bills WHERE status = 'paid'
            ) as combined_total
        `,
        revenueToday: `
            SELECT SUM(total) as total FROM (
                SELECT COALESCE(SUM(amount), 0) as total FROM accounts_receivable WHERE paymentStatus = 'paid' AND DATE(dueDate) = ?
                UNION ALL
                SELECT COALESCE(SUM(totalAmount), 0) as total FROM patient_bills WHERE status = 'paid' AND DATE(billDate) = ?
            ) as combined_today
        `,
    };

    const params = {
        admissionsLast7Days: [sevenDaysAgo],
        appointmentsLast7Days: [sevenDaysAgo],
        newPatientsToday: [today],
        appointmentsToday: [today],
        bedOccupancy: [],
        totalRevenue: [],
        revenueToday: [today, today],
    };

    const summaryData = {};

    try {
        for (const [key, sql] of Object.entries(queries)) {
            const results = await new Promise((resolve, reject) => {
                executeQuery(sql, params[key], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
            summaryData[key] = results;
        }

        console.log("Analytics summary results:", summaryData);
        res.json(summaryData);
    } catch (err) {
        console.error("Analytics summary query error:", err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message || err });
    }
});


// GET all analytics data
router.get('/', (req, res) => {
    const queries = {
        monthlyRevenue: `
            SELECT month, SUM(total) as total FROM (
                SELECT DATE_FORMAT(dueDate, '%Y-%m') as month, amount as total
                FROM accounts_receivable 
                WHERE paymentStatus = 'paid'
                UNION ALL
                SELECT DATE_FORMAT(billDate, '%Y-%m') as month, totalAmount as total
                FROM patient_bills
                WHERE status = 'paid'
            ) as combined_revenue
            GROUP BY month 
            ORDER BY month ASC
            LIMIT 12;
        `,
        appointmentsPerDept: `
            SELECT d.name, COUNT(a.id) as count 
            FROM appointments a 
            JOIN employees e ON a.doctorId = e.id 
            JOIN departments d ON e.departmentId = d.id 
            GROUP BY d.name;
        `,
        patientAdmissions: `
            SELECT DATE_FORMAT(recordDate, '%Y-%m-%d') as date, COUNT(id) as count 
            FROM medical_records 
            GROUP BY date 
            ORDER BY date DESC
            LIMIT 30;
        `
    };

    const promises = Object.entries(queries).map(([key, sql]) => {
        return new Promise((resolve, reject) => {
            executeQuery(sql, [], (err, results) => {
                if (err) return reject(err);
                resolve({ [key]: results });
            });
        });
    });

    Promise.all(promises)
        .then(results => {
            const analyticsData = results.reduce((acc, current) => ({...acc, ...current}), {});
            res.json(analyticsData);
        })
        .catch(err => {
            console.error("Analytics query error:", err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
});

module.exports = router;
