const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const {
    storeRefreshToken,
    isRefreshTokenStored,
    registerUser,
    findUserByEmail,
    findUserByUsername,
    updateEmailVerificationStatus,
    updateVerificationToken
} = require('../queries/auth');
const config = require('../config.json');
const emailService = require('../emailService');

// Register a new user
router.post('/register', async (req, res, next) => {
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

        const verificationToken = emailService.generateVerificationToken(user_id);

        await updateVerificationToken(user_id, verificationToken);
        await emailService.sendVerificationEmail(email, verificationToken);

        res.status(200).json({ message: 'Registration successful', user_id });
    } catch (error) {
        console.error('Error registering user', error);
        next(error);
    }
});

// User login
router.post('/login', async (req, res, next) => {
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
            return res.status(401).json({ error: 'Email not verified' });
        }

        const token = jwt.sign({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
        }, config.jwtSecret, { expiresIn: '1h' });

        const refreshToken = jwt.sign({ user_id: user.user_id }, config.refreshTokenSecret);
        await storeRefreshToken(refreshToken, user.user_id);

        res.cookie('refreshToken', refreshToken, { httpOnly: true, path: '/api/auth/refresh_token', sameSite: 'None', secure: true });

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in', error);
        next(error);
    }
});

// Verify email
router.post('/verify/:token', async (req, res, next) => {
    try {
        const { token } = req.params;

        const decoded = jwt.verify(token, config.jwtSecret);
        const { user_id } = decoded;
        await updateEmailVerificationStatus(user_id);

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email', error);
        next(error);
    }
});

// Refresh access token
router.get('/refresh_token', async (req, res, next) => {
    try {
        const refreshToken = req.cookies ? req.cookies.refreshToken : null;
        if (!refreshToken) {
            return res.status(403).json({ error: 'Refresh token is required' });
        }

        if (!(await isRefreshTokenStored(refreshToken))) {
            return res.status(403).json({ error: 'Refresh token is not in store' });
        }

        try {
            const payload = jwt.verify(refreshToken, config.refreshTokenSecret);
            const token = jwt.sign({ user_id: payload.user_id }, config.jwtSecret, { expiresIn: '1h' });
            return res.status(200).json({ accessToken: token });
        } catch (error) {
            console.error('Error refreshing access token', error);
            next(error);
        }
    } catch (error) {
        console.error('Error refreshing access token', error);
        next(error);
    }
});

module.exports = router;
