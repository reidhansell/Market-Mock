const { executeQuery } = require('../queryExecutor');
const ExpectedError = require('../../tools/ExpectedError');

/*  Queries assume that the caller has already validated the data.
    As a last line of defense, the database has its own constraints
    which, when triggered, will be logged and returned as a 500.   */

async function insertTicker(ticker) {
    const query = 'INSERT INTO Tickers (ticker_symbol, company_name) VALUES (?, ?)';
    const parameters = [ticker.ticker_symbol, ticker.company_name];
    const results = await executeQuery(query, parameters);
    if (results.affectedRows === 0) {
        throw new ExpectedError('Failed to store ticker', 500, `Failed query: "${query}" with parameters: "${parameters}"`);
    }
}

async function checkTickerSymbol(symbol) {
    const query = 'SELECT * FROM Tickers WHERE ticker_symbol = ?';
    const parameters = [symbol];
    const results = await executeQuery(query, parameters);
    if (results.affectedRows === 0) {
        throw new ExpectedError('Failed to get ticker', 404, `Query: "${query}" with parameters: "${parameters}" returned no results`);
    }
    return results[0];
}

async function searchTickersByCompanyName(company_name) {
    const sql = `
      SELECT ticker_symbol, company_name
      FROM Tickers
      WHERE company_name LIKE ?
      LIMIT 50
    `;
    const searchTerm = `%${company_name}%`;
    const result = await executeQuery(sql, [searchTerm]);
    if (results.affectedRows === 0) {
        throw new ExpectedError('Failed to get tickers', 404, `Query: "${query}" with parameters: "${parameters}" returned no results`);
    }
    return result;
}

module.exports = {
    insertTicker,
    checkTickerSymbol,
    searchTickersByCompanyName
};

