import { executeQuery } from '../QueryExecutor';
import ExpectedError from '../../tools/ExpectedError';
import Ticker from '../../models/Ticker';
import { ResultObject } from '../QueryExecutor';

async function insertTicker(ticker: Ticker): Promise<void> {
    const query = 'INSERT INTO Ticker (ticker_symbol, company_name) VALUES (?, ?)';
    const parameters = [ticker.ticker_symbol, ticker.company_name];
    const queryResults = await executeQuery(query, parameters) as ResultObject;
    if (queryResults.affectedRows === 0) {
        throw new ExpectedError('Failed to store ticker', 500, `Failed query: "${query}" with parameters: "${parameters}"`);
    }
}

async function checkTickerExists(symbol: string): Promise<Ticker | null> {
    const query = 'SELECT * FROM Ticker WHERE ticker_symbol = ?';
    const parameters = [symbol];
    const results = await executeQuery(query, parameters) as Ticker[];
    if (results.length === 0) {
        return null;
    }
    return results[0];
}

async function searchTickersByCompanyName(company_name: string): Promise<Ticker[]> {
    const sql = `
      SELECT ticker_symbol, company_name
      FROM Ticker
      WHERE company_name LIKE ?
      LIMIT 50
    `;
    const searchTerm = `%${company_name}%`;
    const results = await executeQuery(sql, [searchTerm]) as Ticker[];
    /* Empty set acceptable, not looking for a particular record */
    return results;
}

export {
    insertTicker,
    checkTickerExists,
    searchTickersByCompanyName
};
