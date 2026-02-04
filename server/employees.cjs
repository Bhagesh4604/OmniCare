const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/:id/upload-photo', upload.single('profilePhoto'), (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const profileImageUrl = `/uploads/${req.file.filename}`;
    const sql = 'UPDATE employees SET profileImageUrl = ? WHERE id = ?';
    executeQuery(sql, [profileImageUrl, id], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to update profile picture.' });
        }
        res.json({ success: true, message: 'Profile picture updated!', profileImageUrl: profileImageUrl });
    });
});

// GET all employees
router.get('/', (req, res) => {
  const sql = `
    SELECT e.*, d.name as departmentName 
    FROM employees e 
    LEFT JOIN departments d ON e.departmentId = d.id 
    ORDER BY e.id DESC
  `;
  executeQuery(sql, [], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
    res.json(results);
  });
});

// GET all departments
router.get('/departments', (req, res) => {
    const sql = 'SELECT * FROM departments';
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// POST a new employee
router.post('/add', (req, res) => {
  const { employeeId, firstName, lastName, email, password, phone, departmentId, position, role, hireDate, salary } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ success: false, message: 'Error hashing password.' });

      const sql = `INSERT INTO employees (employeeId, firstName, lastName, email, password, phone, departmentId, position, role, status, hireDate, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`;
      const params = [employeeId, firstName, lastName, email, hash, phone, departmentId, position, role, hireDate, salary];
      
      executeQuery(sql, params, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'An employee with this email already exists.' });
            }
            return res.status(500).json({ success: false, message: 'Failed to add employee' });
        }
        res.json({ success: true, message: 'Employee added successfully!' });
      });
  });
});

// PUT (update) an employee
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, departmentId, position, status, salary, password } = req.body;

    let sql = 'UPDATE employees SET firstName = ?, lastName = ?, email = ?, phone = ?, departmentId = ?, position = ?, status = ?, salary = ?';
    const params = [firstName, lastName, email, phone, departmentId, position, status, salary];

    // If a new password is provided, hash it and add it to the query
    if (password && password.length > 0) {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ success: false, message: 'Error hashing password.' });

            sql += ', password = ? WHERE id = ?';
            params.push(hash, id);

            executeQuery(sql, params, (queryErr, result) => {
                if (queryErr) return res.status(500).json({ success: false, message: 'Failed to update employee' });
                res.json({ success: true, message: 'Employee updated successfully!' });
            });
        });
    } else {
        // If no new password, run the original query
        sql += ' WHERE id = ?';
        params.push(id);

        executeQuery(sql, params, (err, result) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to update employee' });
            res.json({ success: true, message: 'Employee updated successfully!' });
        });
    }
});

router.put('/change-password/:id', (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    const getSql = 'SELECT password FROM employees WHERE id = ?';
    executeQuery(getSql, [id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error.' });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Employee not found.' });

        const hashedPassword = results[0].password;

        bcrypt.compare(oldPassword, hashedPassword, (compareErr, isMatch) => {
            if (compareErr) return res.status(500).json({ success: false, message: 'Error comparing passwords.' });
            if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect old password.' });

            bcrypt.hash(newPassword, 10, (hashErr, hash) => {
                if (hashErr) return res.status(500).json({ success: false, message: 'Error hashing new password.' });

                const updateSql = 'UPDATE employees SET password = ? WHERE id = ?';
                executeQuery(updateSql, [hash, id], (updateErr, updateResult) => {
                    if (updateErr) return res.status(500).json({ success: false, message: 'Failed to update password.' });
                    res.json({ success: true, message: 'Password updated successfully!' });
                });
            });
        });
    });
});

router.put('/reset-password/:id', (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    bcrypt.hash(password, 10, (hashErr, hash) => {
        if (hashErr) return res.status(500).json({ success: false, message: 'Error hashing new password.' });

        const updateSql = 'UPDATE employees SET password = ? WHERE id = ?';
        executeQuery(updateSql, [hash, id], (updateErr, updateResult) => {
            if (updateErr) return res.status(500).json({ success: false, message: 'Failed to reset password.' });
            res.json({ success: true, message: 'Password reset successfully!' });
        });
    });
});

// DELETE an employee
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM employees WHERE id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete employee' });
        res.json({ success: true, message: 'Employee deleted successfully!' });
    });
});

module.exports = router;
