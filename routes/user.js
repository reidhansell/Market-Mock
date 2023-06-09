const express = require('express');
const router = express.Router();
const { getUserData } = require('../queries/user.js');
const { authenticateToken } = require('../middleware.js');

router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const userData = await getUserData(user_id);
        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user data', error);
        next(error);
    }
});

module.exports = router;



