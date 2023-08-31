import axios from 'axios';
import config from '../config.json';
import ExpectedError from './ExpectedError';
import { insertTicker, checkTickerExists } from '../database/queries/ticker';
import { ExchangeTickersResponse } from '../models/MarketStackResponses';
import Ticker from '../models/Ticker';

interface MarketStackTicker {
    name: string;
    symbol: string;
    has_intraday: boolean;
    has_eod: boolean;
}

async function fetchTickersFromAPI(exchange: string): Promise<MarketStackTicker[]> {
    const tickers: MarketStackTicker[] = [];
    const url = `https://api.marketstack.com/v1/exchanges/${exchange}/tickers?access_key=${config.marketStackKey}&limit=10000`;
    let page = 1;
    let response;

    do {
        const offset = page > 1 ? (page - 1) * 10000 + 1 : 0;
        try {
            const axiosResponse = await axios.get(`${url}&offset=${offset}`);
            response = axiosResponse.data as ExchangeTickersResponse;
        } catch (error: any) {
            throw new ExpectedError('Could not fetch data from MarketStack', 500, `Error fetching data from MarketStack for exchange ${exchange}: ${error.message}`);
        }

        tickers.push(...response.data.tickers);

        page++;
    } while (response.data.tickers.length >= 10000 && page < 20);

    return tickers;
}

async function syncTickers(): Promise<void> {
    console.log("Beginning tickers sync.");
    console.log("Fetching tickers from MarketStack.");

    // Fetch tickers from XNYS and XNAS
    const mainExchanges = ['XNYS', 'XNAS'];
    const mainTickers = (await Promise.all(mainExchanges.map(fetchTickersFromAPI))).flat();

    // Fetch tickers from IEXG
    const iexgTickers = await fetchTickersFromAPI('IEXG');

    // Filter IEXG tickers to include only those that are listed on main exchanges
    const validIexgTickers = iexgTickers.filter(iexgTicker => mainTickers.some(mainTicker => mainTicker.symbol === iexgTicker.symbol));

    // Merge main and IEXG tickers
    const tickers = mainTickers.map(mainTicker => {
        const iexgTicker = validIexgTickers.find(ticker => ticker.symbol === mainTicker.symbol);
        return {
            ...mainTicker,
            has_intraday: mainTicker.has_intraday || iexgTicker?.has_intraday,
            has_eod: mainTicker.has_eod || iexgTicker?.has_eod
        } as MarketStackTicker;
    });

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
                console.error(`Error storing ticker ${ticker.symbol}: ${error.message}`);
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

async function storeTicker(ticker: MarketStackTicker): Promise<void> {
    const existingTicker = await checkTickerExists(ticker.symbol);

    if (!existingTicker) {
        await insertTicker({ ticker_symbol: ticker.symbol, company_name: ticker.name });
    } else if (existingTicker.company_name !== ticker.name) {
        console.error(`Ticker ${ticker.symbol} company name changed from ${existingTicker.company_name} to ${ticker.name}`);
    }
}

export { syncTickers };
