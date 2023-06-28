import axios from 'axios';
import config from '../config.json';
import ExpectedError from './ExpectedError';
import { insertTicker, checkTickerExists } from '../database/queries/ticker';
import Ticker from '../models/Ticker';

interface MarketStackTicker {
    symbol: string;
    name: string;
}

async function fetchTickersFromAPI(exchange: string): Promise<Ticker[]> {
    let tickers: Ticker[] = [];
    let page = 1;
    let response;

    do {
        try {
            response = await axios.get(`https://api.marketstack.com/v1/exchanges/${exchange}/tickers?access_key=${config.marketStackKey}&limit=10000&offset=${page > 1 ? (page - 1) * 10000 + 1 : 0}`);
        } catch (error: any) {
            throw new ExpectedError('Could not fetch data from MarketStack', 500, `Error fetching data from MarketStack for exchange ${exchange}: ${error.message}`);
        }

        tickers = tickers.concat(response.data.data.tickers.filter((ticker: MarketStackTicker) => ticker.name).map((ticker: MarketStackTicker) => ({
            ticker_symbol: ticker.symbol,
            company_name: ticker.name
        })));

        page++;
    } while (response.data.data.tickers.length >= 10000 && page < 4);

    return tickers;
}

async function storeTicker(ticker: Ticker): Promise<void> {
    const existingTicker = await checkTickerExists(ticker.ticker_symbol);

    if (existingTicker) {
        if (existingTicker.company_name !== ticker.company_name) {
            console.error(`Ticker ${ticker.ticker_symbol} company name changed from ${existingTicker.company_name} to ${ticker.company_name}`);
        }
    } else {
        await insertTicker(ticker);
    }
}

async function syncTickers(): Promise<void> {
    console.log("Beginning tickers sync.");
    console.log("Fetching tickers from MarketStack.");
    const NYSETickers = await fetchTickersFromAPI('XNYS');
    const NASDAQTickers = await fetchTickersFromAPI('XNAS');
    console.log("Fetch successful.");

    console.log("Storing tickers in database.");
    const tickers = [...NYSETickers, ...NASDAQTickers];
    const totalTickers = tickers.length;

    for (const [i, ticker] of tickers.entries()) {
        try { await storeTicker(ticker); }
        catch (error: any) {
            if (error instanceof ExpectedError) {
                error.statusCode === 500 ? console.error(error.devMessage) : null;
            }
            else {
                console.error(`Error storing ticker ${ticker.ticker_symbol}: ${error.message}`);
                console.log('Continuing...')
            }
        }

        if (i === Math.round(totalTickers * 0.25)) {
            console.log("25% of tickers have been stored.");
        }
        if (i === Math.round(totalTickers * 0.5)) {
            console.log("50% of tickers have been stored.");
        }
        if (i === Math.round(totalTickers * 0.75)) {
            console.log("75% of tickers have been stored.");
        }
    }
    console.log("Store successful.");
    console.log("Completed tickers sync.");
}

export { syncTickers };
