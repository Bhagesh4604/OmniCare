const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gemini.test.hms@gmail.com',
    pass: 'yyyyyyyyyyyyyyyy' // Replace with your app password
  }
});

console.log('transporter:', transporter);

async function sendPasswordResetEmail(to, token) {
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;
  const info = await transporter.sendMail({
    from: '"Shree Medicare HMS" <noreply@hms.com>',
    to: to,
    subject: "Password Reset Request",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><p>Please click on the following link, or paste this into your browser to complete the process:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = { sendPasswordResetEmail };
