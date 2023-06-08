const jwt = require('jsonwebtoken');
const config = require('./config.json');
const { findUserById } = require('./queries/auth');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, config.jwtSecret, async (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden' });
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
}

module.exports = authenticateToken;


