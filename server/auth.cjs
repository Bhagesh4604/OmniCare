const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');
const bcrypt = require('bcryptjs');

// Unified Staff Login
router.post('/staff/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
  }

  const sql = 'SELECT * FROM employees WHERE email = ?';
  
  executeQuery(sql, [email], (err, results) => {
    if (err) {
      console.error("Database error during login:", err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = results[0];

    if (user.role !== role) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.password) {
        console.error(`Login attempt for user ${email} failed: No password is set in the database.`);
        return res.status(401).json({ success: false, message: 'Invalid credentials. Account not fully configured.' });
    }

    bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        console.error("Bcrypt comparison error:", bcryptErr);
        return res.status(500).json({ success: false, message: 'Error checking password' });
      }

      if (isMatch) {
        delete user.password; 
        res.json({ success: true, message: 'Login successful!', user: user });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }
    });
  });
});

module.exports = router;
