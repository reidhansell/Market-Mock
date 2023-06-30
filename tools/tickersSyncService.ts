import axios from 'axios';
import config from '../config.json';
import ExpectedError from './ExpectedError';
import { insertTicker, checkTickerExists } from '../database/queries/Ticker';
import Ticker from '../models/Ticker';

interface MarketStackTicker {
    symbol: string;
    name: string;
}

async function fetchTickersFromAPI(exchange: string): Promise<Ticker[]> {
    const tickers: Ticker[] = [];
    const url = `https://api.marketstack.com/v1/exchanges/${exchange}/tickers?access_key=${config.marketStackKey}&limit=10000`;
    let page = 1;
    let response;

    do {
        const offset = page > 1 ? (page - 1) * 10000 + 1 : 0;
        try {
            response = await axios.get(`${url}&offset=${offset}`);
        } catch (error: any) {
            throw new ExpectedError('Could not fetch data from MarketStack', 500, `Error fetching data from MarketStack for exchange ${exchange}: ${error.message}`);
        }

        const validTickers = response.data.data.tickers.filter((ticker: MarketStackTicker) => ticker.name);
        tickers.push(...validTickers.map((ticker: MarketStackTicker) => ({ ticker_symbol: ticker.symbol, company_name: ticker.name })));

        page++;
    } while (response.data.data.tickers.length >= 10000 && page < 4);

    return tickers;
}

async function storeTicker(ticker: Ticker): Promise<void> {
    const existingTicker = await checkTickerExists(ticker.ticker_symbol);

    if (!existingTicker) {
        await insertTicker(ticker);
    } else if (existingTicker.company_name !== ticker.company_name) {
        console.error(`Ticker ${ticker.ticker_symbol} company name changed from ${existingTicker.company_name} to ${ticker.company_name}`);
    }
}

async function syncTickers(): Promise<void> {
    console.log("Beginning tickers sync.");
    console.log("Fetching tickers from MarketStack.");

    const exchanges = ['XNYS', 'XNAS'];
    const tickers = (await Promise.all(exchanges.map(fetchTickersFromAPI))).flat();
    console.log("Fetch successful.");

    console.log("Storing tickers in database.");
    const totalTickers = tickers.length;

    for (const [i, ticker] of tickers.entries()) {
        try {
            await storeTicker(ticker);
        }
        catch (error: any) {
            if (error instanceof ExpectedError) {
                error.statusCode === 500 && console.error(error.devMessage);
            } else {
                console.error(`Error storing ticker ${ticker.ticker_symbol}: ${error.message}`);
                console.log('Continuing...');
            }
        }

        const progress = Math.round(totalTickers * 0.25);
        if (i === progress || i === 2 * progress || i === 3 * progress) {
            console.log(`${(i / progress) * 25}% of tickers have been stored.`);
        }
    }

    console.log("Store successful.");
    console.log("Completed tickers sync.");
}

export { syncTickers };
