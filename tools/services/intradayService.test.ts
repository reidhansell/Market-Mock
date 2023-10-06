jest.mock('axios');
jest.mock('../../database/queries/ticker');

import { getIntradayDataForTicker } from './intradayService';
import axios from 'axios';
import { getLatestIntradayData, insertIntradayData } from '../../database/queries/ticker';
import TickerIntraday from '../../models/TickerIntraday';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetLatestIntradayData = getLatestIntradayData as jest.MockedFunction<typeof getLatestIntradayData>;
const mockedInsertIntradayData = insertIntradayData as jest.MockedFunction<typeof insertIntradayData>;

describe('intradayService', () => {
    const unconvertedTimestamp = Math.floor(Date.now());
    const unixTimestamp = Math.floor(unconvertedTimestamp / 1000);
    const unconvertedTimestampOld = Math.floor(Date.now()) - (3600000 * 2);
    const unixTimestampOld = Math.floor(unconvertedTimestampOld / 1000);
    const dummyIntradayDataFromDB: TickerIntraday[] = [

        {
            open: 150.0,
            high: 155.0,
            low: 145.0,
            last: 154.5,
            close: 154.0,
            volume: 1000000,
            symbol: 'AAPL',
            exchange: 'NASDAQ',
            date: unixTimestamp,
        },
        {
            open: 151.0,
            high: 156.0,
            low: 146.0,
            last: 155.5,
            close: 155.0,
            volume: 1050000,
            symbol: 'AAPL',
            exchange: 'NASDAQ',
            date: unixTimestampOld,
        },
    ];

    const dummyIntradayDataFromMarketStack: TickerIntraday[] = [

        {
            open: 150.0,
            high: 155.0,
            low: 145.0,
            last: 154.5,
            close: 154.0,
            volume: 1000000,
            symbol: 'AAPL',
            exchange: 'NASDAQ',
            date: unconvertedTimestamp,
        },
        {
            open: 151.0,
            high: 156.0,
            low: 146.0,
            last: 155.5,
            close: 155.0,
            volume: 1050000,
            symbol: 'AAPL',
            exchange: 'NASDAQ',
            date: unconvertedTimestampOld,
        },
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return recent intraday data from the database', async () => {
        mockedGetLatestIntradayData.mockResolvedValueOnce(dummyIntradayDataFromDB);
        const result = await getIntradayDataForTicker('AAPL');
        expect(result).toEqual(dummyIntradayDataFromDB);
        expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should fetch intraday data from MarketStack when no recent data is found in the database', async () => {
        mockedGetLatestIntradayData.mockResolvedValueOnce([]);
        mockedAxios.get.mockResolvedValueOnce({ data: { data: dummyIntradayDataFromMarketStack } });

        const result = await getIntradayDataForTicker('AAPL');
        expect(result).toEqual(dummyIntradayDataFromDB);
        expect(mockedAxios.get).toHaveBeenCalled();
        expect(mockedInsertIntradayData).toHaveBeenCalled();
    });

    it('should fetch intraday data from MarketStack when old data is found in the database', async () => {
        const oldIntradayData: TickerIntraday[] = [
            {
                open: 130.0,
                high: 135.0,
                low: 125.0,
                last: 134.5,
                close: 134.0,
                volume: 900000,
                symbol: 'AAPL',
                exchange: 'NASDAQ',
                date: unixTimestampOld,
            },
        ];
        mockedGetLatestIntradayData.mockResolvedValueOnce(oldIntradayData);
        mockedAxios.get.mockResolvedValueOnce({ data: { data: dummyIntradayDataFromMarketStack } });

        const result = await getIntradayDataForTicker('AAPL');
        expect(result).toEqual(dummyIntradayDataFromDB);
        expect(mockedAxios.get).toHaveBeenCalled();
        expect(mockedInsertIntradayData).toHaveBeenCalled();
    });
});
