jest.mock('axios');
jest.mock('../../database/queries/ticker');

import axios from 'axios';
import { syncTickers } from './tickersSyncService';
import { insertTicker, checkTickerExists } from '../../database/queries/ticker';

describe('syncTickers', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully sync tickers', async () => {
        (axios.get as jest.Mock).mockResolvedValueOnce({
            status: 200,
            data: {
                data: {
                    tickers: [{ symbol: 'AAPL', name: 'Apple Inc.', has_intraday: true, has_eod: true }]
                }
            }
        }).mockResolvedValueOnce({
            status: 200,
            data: {
                data: {
                    tickers: [{ symbol: 'AAPL', name: 'Apple Inc.', has_intraday: true, has_eod: true }]
                }
            }
        }).mockResolvedValueOnce({
            status: 200,
            data: {
                data: {
                    tickers: [{ symbol: 'AAPL', name: 'Apple Inc.', has_intraday: true, has_eod: true }]
                }
            }
        });

        (checkTickerExists as jest.Mock).mockResolvedValueOnce(null);
        (insertTicker as jest.Mock).mockResolvedValueOnce(true);

        await expect(syncTickers()).resolves.not.toThrow();
    });

    it('should handle an error from the API', async () => {
        (axios.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        await expect(syncTickers()).rejects.toThrow('Could not fetch data from MarketStack');
    });

    it('should handle a ticker that already exists', async () => {
        (axios.get as jest.Mock).mockResolvedValueOnce({
            status: 200,
            data: {
                data: {
                    tickers: [{ symbol: 'AAPL', name: 'Apple Inc.', has_intraday: true, has_eod: true }]
                }
            }
        }).mockResolvedValueOnce({
            status: 200,
            data: {
                data: {
                    tickers: [{ symbol: 'AAPL', name: 'Apple Inc.', has_intraday: true, has_eod: true }]
                }
            }
        }).mockResolvedValueOnce({
            status: 200,
            data: {
                data: {
                    tickers: [{ symbol: 'AAPL', name: 'Apple Inc.', has_intraday: true, has_eod: true }]
                }
            }
        });

        (checkTickerExists as jest.Mock).mockResolvedValueOnce({ ticker_symbol: 'AAPL', company_name: 'Apple' });
        (insertTicker as jest.Mock).mockResolvedValueOnce(true);

        await expect(syncTickers()).resolves.not.toThrow();
    });

    it('should handle a ticker with a changed company name', async () => {

        (axios.get as jest.Mock).mockResolvedValueOnce({
            status: 200,
            data: {
                data: {
                    tickers: [{ symbol: 'AAPL', name: 'Apple Inc.', has_intraday: true, has_eod: true }]
                }
            }
        }).mockResolvedValueOnce({
            status: 200,
            data: {
                data: {
                    tickers: [{ symbol: 'AAPL', name: 'Apple Inc.', has_intraday: true, has_eod: true }]
                }
            }
        }).mockResolvedValueOnce({
            status: 200,
            data: {
                data: {
                    tickers: [{ symbol: 'AAPL', name: 'Apple Corp.', has_intraday: true, has_eod: true }]
                }
            }
        });

        (checkTickerExists as jest.Mock).mockResolvedValueOnce({ ticker_symbol: 'AAPL', company_name: 'Apple' });
        (insertTicker as jest.Mock).mockResolvedValueOnce(true);
        console.log('*** EXPECTED TEST NOTICE: There should be an error below ***');
        /*  This is one of the only times that we want to see an error in the console. 
            This is because we want to know if a company name has changed. 
            This is not a problem, but we want to be aware of it.   */
        await expect(syncTickers()).resolves.not.toThrow();
    });
});
