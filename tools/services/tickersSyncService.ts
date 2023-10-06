import axios from 'axios';
import config from '../../config.json';
import ExpectedError from '../utils/ExpectedError';
import { insertTicker, checkTickerExists } from '../../database/queries/ticker';

interface MarketStackTicker {
    name: string;
    symbol: string;
    has_intraday: boolean;
    has_eod: boolean;
}

async function fetchTickersFromAPI(exchange: string): Promise<MarketStackTicker[]> {
    const baseURL = `https://api.marketstack.com/v1/exchanges/${exchange}/tickers?access_key=${config.marketStackKey}&limit=10000`;
    let tickers: MarketStackTicker[] = [];
    let page = 1;
    let offset = 0;

    while (page < 20) {
        const url = `${baseURL}&offset=${offset}`;
        const response = await fetchMarketStackData(url, exchange);
        tickers = tickers.concat(response.data.tickers);

        if (response.data.tickers.length < 10000) {
            break;
        }
        offset += 10000;
        page++;
    }
    return tickers;
}

async function fetchMarketStackData(url: string, exchange: string) {
    try {
        return await axios.get(url);
    } catch (error: any) {
        throw new ExpectedError('Could not fetch data from MarketStack', 500, `Error fetching data from MarketStack for exchange ${exchange}: ${error.message}`);
    }
}

async function syncTickers(): Promise<void> {
    const mainTickers = (await Promise.all(['XNYS', 'XNAS'].map(fetchTickersFromAPI))).flat();
    const validIexgTickers = (await fetchTickersFromAPI('IEXG')).filter(ticker => mainTickers.some(main => main.symbol === ticker.symbol));

    const mergedTickers = mergeTickers(mainTickers, validIexgTickers);

    for (const [i, ticker] of mergedTickers.entries()) {
        try {
            await storeTicker(ticker);
        } catch (error: any) {
            handleErrorWhileStoringTicker(error, ticker);
        }
        logProgress(i, mergedTickers.length);
    }
}

function mergeTickers(mainTickers: MarketStackTicker[], iexgTickers: MarketStackTicker[]): MarketStackTicker[] {
    return mainTickers.map(mainTicker => {
        const iexgTicker = iexgTickers.find(ticker => ticker.symbol === mainTicker.symbol);
        return {
            ...mainTicker,
            has_intraday: mainTicker.has_intraday || iexgTicker?.has_intraday,
            has_eod: mainTicker.has_eod || iexgTicker?.has_eod
        } as MarketStackTicker;
    });
}

async function storeTicker(ticker: MarketStackTicker): Promise<void> {
    const existingTicker = await checkTickerExists(ticker.symbol);
    if (!existingTicker) {
        await insertTicker({ ticker_symbol: ticker.symbol, company_name: ticker.name });
    } else if (existingTicker.company_name !== ticker.name) {
        console.error(`Ticker ${ticker.symbol} company name changed from ${existingTicker.company_name} to ${ticker.name}`);
    }
}

function handleErrorWhileStoringTicker(error: any, ticker: MarketStackTicker) {
    if (error instanceof ExpectedError && error.statusCode === 500) {
        console.error(error.devMessage);
    } else {
        console.error(`Error storing ticker ${ticker.symbol}: ${error.message}`);
    }
}

function logProgress(currentIndex: number, total: number) {
    const progressCheckpoints = [0.25, 0.5, 0.75];
    const currentProgress = currentIndex / total;
    if (progressCheckpoints.includes(currentProgress)) {
        console.log(`${currentProgress * 100}% of tickers have been stored.`);
    }
}

export { syncTickers };