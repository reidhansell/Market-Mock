const axios = require('axios');
const connection = require('../databaseManager');
const config = require('../config.json');

async function fetchAndSaveTickers() {
    try {
        let NYSETickers = [];
        let page = 1;
        let NYSETickersResponse = null;
        do {
            NYSETickersResponse = await axios.get(`https://api.marketstack.com/v1/exchanges/XNYS/tickers?access_key=${config.marketStackKey}&limit=10000&offset=${page > 1 ? (page - 1) * 10000 + 1 : 0}`);
            NYSETickers = NYSETickers.concat(NYSETickersResponse.data.data.tickers.filter((ticker) => ticker.name).map((ticker) => ({
                ticker_symbol: ticker.symbol,
                company_name: ticker.name
            })));
            page++;
        } while (NYSETickersResponse.data.data.tickers.length >= 10000 && page < 4);

        let NASDAQTickers = [];
        page = 1;
        let NASDAQTickersResponse = null
        do {
            NASDAQTickersResponse = await axios.get(`https://api.marketstack.com/v1/exchanges/XNAS/tickers?access_key=${config.marketStackKey}&limit=10000&offset=${page > 1 ? (page - 1) * 10000 + 1 : 0}`);
            NASDAQTickers = NASDAQTickers.concat(NASDAQTickersResponse.data.data.tickers.filter((ticker) => ticker.name).map((ticker) => ({
                ticker_symbol: ticker.symbol,
                company_name: ticker.name
            })));
            page++;
        } while (NASDAQTickersResponse.data.data.tickers.length >= 10000 && page < 4);

        const tickers = [...NYSETickers, ...NASDAQTickers];
        for (const ticker of tickers) {
            const selectQuery = 'SELECT * FROM Tickers WHERE ticker_symbol = ?';
            const rows = await connection.query(selectQuery, [ticker.ticker_symbol]);
            if (rows.length > 0) {
                if (rows[0].company_name !== ticker.company_name) {
                    console.log(`Ticker ${ticker.ticker_symbol} company name changed from ${rows[0].company_name} to ${ticker.company_name}`);
                }
            } else {
                const insertQuery = 'INSERT INTO Tickers (ticker_symbol, company_name) VALUES (?, ?)';
                //TODO make all queries look like the one below with .catch
                const results = await connection.query(insertQuery, [ticker.ticker_symbol, ticker.company_name]).catch(error => {
                    console.error('Error occurred during query execution:', error);
                    throw error;
                });
                if (results.affectedRows === 0) {
                    throw new Error(`Could not insert ticker: ${ticker.ticker_symbol}`);
                }
            }
        }

    } catch (error) {
        console.error('Error fetching and saving tickers:', error.message || error);
    }
}

async function searchTickersByCompanyName(query) {
    const sql = `
      SELECT ticker_symbol, company_name
      FROM Tickers
      WHERE company_name LIKE ?
      LIMIT 50
    `;

    const searchTerm = `%${query}%`;
    const result = await connection.query(sql, [searchTerm]);
    return result[0];
}

module.exports = {
    fetchAndSaveTickers,
    searchTickersByCompanyName
};


