import { executeQuery, ResultObject } from '../queryExecutor';
import ExpectedError from '../../tools/utils/ExpectedError';
import Ticker from '../../models/Ticker';
import TickerEndOfDay from "../../models/TickerEndOfDay";
import TickerIntraday from "../../models/TickerIntraday";

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

async function searchTickers(searchTerm: string): Promise<Ticker[]> {
    const sql = `
      SELECT ticker_symbol, company_name
      FROM Ticker
      WHERE company_name LIKE ?
      OR ticker_symbol LIKE ?
      LIMIT 50
    `;
    const searchTermSQL = `%${searchTerm}%`;
    const results = await executeQuery(sql, [searchTermSQL, searchTermSQL]) as Ticker[];
    return results;
}

async function insertEODData(eodData: TickerEndOfDay): Promise<void> {
    const query = 'INSERT INTO Ticker_End_Of_Day (ticker_symbol, open, high, low, close, volume, adjusted_open, adjusted_high, adjusted_low, adjusted_close, adjusted_volume, split_factor, dividend, exchange, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const parameters = [eodData.symbol, eodData.open, eodData.high, eodData.low, eodData.close, eodData.volume, eodData.adj_open, eodData.adj_high, eodData.adj_low, eodData.adj_close, eodData.adj_volume, eodData.split_factor, eodData.dividend, eodData.exchange, eodData.date];
    const queryResults = await executeQuery(query, parameters) as ResultObject;
    if (queryResults.affectedRows === 0) {
        throw new ExpectedError('Failed to store EOD data', 500, `Failed query: "${query}" with parameters: "${parameters}"`);
    }
}

async function insertIntradayData(intradayData: TickerIntraday): Promise<void> {
    const query = 'INSERT INTO Ticker_Intraday (ticker_symbol, open, high, low, last, close, volume, exchange, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const parameters = [intradayData.symbol, intradayData.open, intradayData.high, intradayData.low, intradayData.last, intradayData.close, intradayData.volume, intradayData.exchange, intradayData.date];
    const queryResults = await executeQuery(query, parameters) as ResultObject;
    if (queryResults.affectedRows === 0) {
        throw new ExpectedError('Failed to store intraday data', 500, `Failed query: "${query}" with parameters: "${parameters}"`);
    }
}

async function deleteIntradayData(ticker_symbol: string): Promise<void> {
    const query = 'DELETE FROM Ticker_Intraday WHERE ticker_symbol = ?';
    const parameters = [ticker_symbol];
    await executeQuery(query, parameters) as ResultObject;
}

async function deleteEODData(ticker_symbol: string): Promise<void> {
    const query = 'DELETE FROM Ticker_End_Of_Day WHERE ticker_symbol = ?';
    const parameters = [ticker_symbol];
    await executeQuery(query, parameters) as ResultObject;
}

async function getLatestEODData(ticker_symbol: string): Promise<TickerEndOfDay[] | null> {
    const query = 'SELECT * FROM Ticker_End_Of_Day WHERE ticker_symbol = ? ORDER BY date DESC LIMIT 30';
    const parameters = [ticker_symbol];
    const results = await executeQuery(query, parameters) as TickerEndOfDay[];
    if (results.length === 0) {
        return null;
    }
    return results;
}

async function getLatestIntradayData(ticker_symbol: string): Promise<TickerIntraday[] | null> {
    const oneDayAgoTimestamp = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    const query = `
    SELECT * FROM Ticker_Intraday
    WHERE ticker_symbol = ?
    AND date >= ?
    ORDER BY date DESC`;
    const parameters = [ticker_symbol, oneDayAgoTimestamp];
    const results = await executeQuery(query, parameters) as TickerIntraday[];
    if (results.length === 0) {
        return null;
    }
    return results;
}

export {
    insertTicker,
    checkTickerExists,
    searchTickers,
    insertEODData,
    insertIntradayData,
    deleteIntradayData,
    deleteEODData,
    getLatestEODData,
    getLatestIntradayData
};
