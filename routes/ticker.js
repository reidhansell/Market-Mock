const express = require('express');
const router = express.Router();
const { searchTickers } = require('../queries/ticker');

router.get('/search', async (req, res, next) => {
    const { companyName } = req.query;

    const companyNameRegex = /^[a-zA-Z0-9\s.'-]{1,100}$/;

    if (!companyNameRegex.test(companyName)) {
        return res.status(400).json({ error: 'Invalid company name' });
    }

    try {
        const results = await searchTickers(companyName);
        res.json(results);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
