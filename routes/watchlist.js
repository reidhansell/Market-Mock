const express = require('express');
const router = express.Router();
const { getWatchList } = require('../database/queries/watchlist.js');
const { authenticateToken } = require('../tools/authMiddleware.js');

/*  Routes are responsible for data validation and business logic,
    though there are database constraints as a last line of defense.
    all errors will be caught and handled by middleware,
    so the only responses that must be sent are successful ones.
    Queries are reponsible for returning clean and non-null data.   */

router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const watchlist = await getWatchList(user_id);
        res.status(200).json(watchlist);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
