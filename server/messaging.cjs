const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET messages for a specific user (patient or employee)
router.get('/:userId/:userType', (req, res) => {
    const { userId, userType } = req.params;

    // Fetch messages where the user is either sender or receiver
    const sql = `
        SELECT m.*,
               CASE WHEN m.senderType = 'patient' THEN p_sender.firstName ELSE e_sender.firstName END as senderFirstName,
               CASE WHEN m.senderType = 'patient' THEN p_sender.lastName ELSE e_sender.lastName END as senderLastName,
               CASE WHEN m.receiverType = 'patient' THEN p_receiver.firstName ELSE e_receiver.firstName END as receiverFirstName,
               CASE WHEN m.receiverType = 'patient' THEN p_receiver.lastName ELSE e_receiver.lastName END as receiverLastName
        FROM messages m
        LEFT JOIN patients p_sender ON m.senderId = p_sender.id AND m.senderType = 'patient'
        LEFT JOIN employees e_sender ON m.senderId = e_sender.id AND m.senderType = 'employee'
        LEFT JOIN patients p_receiver ON m.receiverId = p_receiver.id AND m.receiverType = 'patient'
        LEFT JOIN employees e_receiver ON m.receiverId = e_receiver.id AND m.receiverType = 'employee'
        WHERE (m.senderId = ? AND m.senderType = ?) OR (m.receiverId = ? AND m.receiverType = ?)
        ORDER BY m.timestamp DESC
    `;
    executeQuery(sql, [userId, userType, userId, userType], (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        res.json(results);
    });
});

// POST: Send a new message
router.post('/send', (req, res) => {
    const { senderId, senderType, receiverId, receiverType, message } = req.body;

    if (!senderId || !senderType || !receiverId || !receiverType || !message) {
        return res.status(400).json({ success: false, message: 'All message fields are required.' });
    }

    const sql = 'INSERT INTO messages (senderId, senderType, receiverId, receiverType, message, timestamp) VALUES (?, ?, ?, ?, ?, NOW())';
    const params = [senderId, senderType, receiverId, receiverType, message];
    executeQuery(sql, params, (err, result) => {
        if (err) {
            console.error('Error sending message:', err);
            return res.status(500).json({ success: false, message: 'Failed to send message' });
        }
        res.json({ success: true, message: 'Message sent successfully!' });
    });
});

// PUT: Mark message as read
router.put('/:messageId/read', (req, res) => {
    const { messageId } = req.params;
    const sql = 'UPDATE messages SET `read` = 1 WHERE id = ?';
    executeQuery(sql, [messageId], (err, result) => {
        if (err) {
            console.error('Error marking message as read:', err);
            return res.status(500).json({ success: false, message: 'Failed to mark message as read' });
        }
        res.json({ success: true, message: 'Message marked as read!' });
    });
});

module.exports = router;
