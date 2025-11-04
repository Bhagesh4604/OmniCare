const { executeQuery } = require('./db.cjs');
const bcrypt = require('bcryptjs');

const plainTextPasswords = [
    { email: 'sarah.j@hospital.com', password: 'password' },
    { email: 'michael.c@hospital.com', password: 'password' }
];

console.log('Starting password hashing process...');

plainTextPasswords.forEach(({ email, password }) => {
    // Find the user first
    executeQuery('SELECT * FROM employees WHERE email = ?', [email], (err, users) => {
        if (err) {
            console.error(`Error finding user ${email}:`, err);
            return;
        }

        if (users.length === 0) {
            console.log(`User ${email} not found. Skipping.`);
            return;
        }

        const user = users[0];

        // Hash the new password
        bcrypt.hash(password, 10, (hashErr, hash) => {
            if (hashErr) {
                console.error(`Error hashing password for ${email}:`, hashErr);
                return;
            }

            // Update the user's password in the database
            executeQuery('UPDATE employees SET password = ? WHERE id = ?', [hash, user.id], (updateErr, result) => {
                if (updateErr) {
                    console.error(`Error updating password for ${email}:`, updateErr);
                } else {
                    console.log(`Successfully updated password for ${email}.`);
                }
            });
        });
    });
});