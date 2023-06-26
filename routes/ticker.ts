const express = require('express');
const router = express.Router();
const { searchTickers } = require('../database/queries/ticker');
const ExpectedError = require('../tools/ExpectedError');

/*  Routes are responsible for data validation and business logic,
    though there are database constraints as a last line of defense.
    all errors will be caught and handled by middleware,
    so the only responses that must be sent are successful ones.
    Queries are reponsible for returning clean and non-null data.   */

router.get('/search', async (req, res, next) => {
    try {
        const { companyName } = req.query;

        if (!companyName || !companyName.trim()) {
            throw new ExpectedError('Company name is required', 400, "Missing companyName in /search route");
        }

        const companyNameRegex = /^[a-zA-Z0-9\s.'-]{1,100}$/;

        if (!companyNameRegex.test(companyName)) {
            throw new ExpectedError('Invalid company name', 400, "Invalid companyName in /search route");
        }

        const results = await searchTickers(companyName);
        res.json(results);
    } catch (error) {
        next(error);
    }
});

module.exports = router;

