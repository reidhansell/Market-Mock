const jwt = require('jsonwebtoken');
const config = require('../config.json');
const { findUserById, isRefreshTokenStored } = require('../database/queries/auth');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        jwt.verify(token, config.jwtSecret, async (err, user) => {
            if (err) {
                console.error('Error verifying token', err);
                return res.status(403).json({ error: err.message });
            }

            try {
                const db_user = await findUserById(user.user_id);
                if (!db_user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                if (db_user.is_email_verified !== 1) {
                    return res.status(403).json({ error: 'Email not verified' });
                }

                req.user = db_user;
                next();
            } catch (error) {
                console.error('Error fetching user data', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error('Error authenticating token', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const authenticateRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        jwt.verify(refreshToken, config.refreshTokenSecret, async (err, user) => {
            if (err) {
                console.error('Error verifying refresh token', err);
                return res.status(403).json({ error: err.message });
            }

            try {
                const tokenIsStored = await isRefreshTokenStored(refreshToken);
                if (!tokenIsStored) {
                    return res.status(403).json({ error: 'Refresh token is not valid' });
                }

                req.user = user;
                next();
            } catch (error) {
                console.error('Error fetching refresh token data', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error('Error authenticating refresh token', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    authenticateToken,
    authenticateRefreshToken
};




