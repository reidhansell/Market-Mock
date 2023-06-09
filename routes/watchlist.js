const express = require('express');
const router = express.Router();
const { getWatchList } = require('../queries/watchlist.js');
const { authenticateToken } = require('../middleware.js');

router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const watchlist = await getWatchList(user_id);
        res.status(200).json(watchlist);
    } catch (error) {
        console.error('Error fetching watchlist', error);
        next(error);
    }
});

module.exports = router;