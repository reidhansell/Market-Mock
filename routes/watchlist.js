const express = require('express');
const router = express.Router();
const { getWatchList } = require('../queries/watchlist.js');
const authenticateToken = require('../middleware.js');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const watchlist = await getWatchList(req.user.user_id);
        res.status(200).json(watchlist);
    } catch (error) {
        console.error('Error fetching watchlist', error);
        res.status(500).json({ error: 'Error fetching watchlist' });
    }
});

module.exports = router;
