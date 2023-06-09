const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const config = require('./config.json');

async function sendVerificationEmail(email, verificationToken) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.email,
                pass: config.emailpassword,
            },
        });

        const emailContent = `
        <h1>Email Verification</h1>
        <p>Please click the following link to verify your email:</p>
        <a href="${config.serverURL}/verify/${verificationToken}">Verify Email</a>
      `;

        const mailOptions = {
            from: config.email,
            to: email,
            subject: 'Email Verification',
            html: emailContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function generateVerificationToken(user_id) {
    const expiresIn = '1d';
    const signedToken = jwt.sign({ user_id: user_id }, config.jwtSecret, { expiresIn });
    return signedToken;
}

module.exports = { sendVerificationEmail, generateVerificationToken };
