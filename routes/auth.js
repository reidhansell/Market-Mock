const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerUser, findUserByEmail, findUserByUsername, updateEmailVerificationStatus, updateVerificationToken } = require('../queries/auth');
const config = require('../config.json');
const nodemailer = require('nodemailer');
const express = require('express')
const router = express.Router()
const { serverURL } = require('../config.json')

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
        <a href="${serverURL}/verify/${verificationToken}">Verify Email</a>
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
        console.error('Error sending email', error);
        throw new Error('Failed to send verification email');
    }
}

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const existingUsername = await findUserByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ error: 'User with this username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user_id = await registerUser(username, email, hashedPassword);
        const verificationToken = generateVerificationToken(user_id);

        await updateVerificationToken(user_id, verificationToken);
        await sendVerificationEmail(email, verificationToken);
        res.status(200).json({ message: 'Registration successful', user_id });
    } catch (error) {
        console.error('Error registering user', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.is_email_verified) {
            return res.status(401).json({ error: 'Not email verified' });
        }

        const token = jwt.sign({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
        }, config.jwtSecret, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

function generateVerificationToken(user_id) {
    const expiresIn = '1d';
    const signedToken = jwt.sign({ user_id: user_id }, config.jwtSecret, { expiresIn });
    return signedToken;
}

router.post('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const decoded = jwt.verify(token, config.jwtSecret);
        const { user_id } = decoded;
        await updateEmailVerificationStatus(user_id);

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email', error);
        res.status(500).json({ error: 'Error verifying email' });
    }
});

module.exports = router
