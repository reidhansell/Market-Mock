const express = require('express');
const router = express.Router();
const { getUserData } = require('../queries/user.js');
const authenticateToken = require('../middleware.js');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const userData = await getUserData(req.user.user_id);
        res.status(200).json({
            user: userData
        });
    } catch (error) {
        console.error('Error fetching user data', error);
        res.status(500).json({ error: 'Error fetching user data' });
    }
});

module.exports = router;

