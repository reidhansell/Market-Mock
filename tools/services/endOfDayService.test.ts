jest.mock('axios');
jest.mock('../../database/queries/ticker');

import { getEODDataForTicker } from './endOfDayService';
import axios from 'axios';
import { getLatestEODData, insertEODData } from '../../database/queries/ticker';
import TickerEndOfDay from '../../models/TickerEndOfDay';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetLatestEODData = getLatestEODData as jest.MockedFunction<typeof getLatestEODData>;
const mockedInsertEODData = insertEODData as jest.MockedFunction<typeof insertEODData>;

describe('endOfDayService', () => {
    const unconvertedTimestamp = Math.floor(Date.now());
    const unixTimestamp = Math.floor(unconvertedTimestamp / 1000);
    const unconvertedTimestampOld = Math.floor(Date.now()) - (3600000 * 25);
    const unixTimestampOld = Math.floor(unconvertedTimestampOld / 1000);
    const dummyEODDataFromDB: TickerEndOfDay[] = [
        {
            open: 150.0,
            high: 155.0,
            low: 145.0,
            close: 154.0,
            volume: 1000000,
            adj_high: 154.5,
            adj_low: 144.5,
            adj_close: 153.5,
            adj_open: 149.5,
            adj_volume: 950000,
            split_factor: 1.0,
            dividend: 0.5,
            symbol: 'AAPL',
            exchange: 'NASDAQ',
            date: unixTimestamp,
        },
        {
            open: 151.0,
            high: 156.0,
            low: 146.0,
            close: 155.0,
            volume: 1050000,
            adj_high: 155.5,
            adj_low: 145.5,
            adj_close: 154.5,
            adj_open: 150.5,
            adj_volume: 955000,
            split_factor: 1.0,
            dividend: 0.6,
            symbol: 'AAPL',
            exchange: 'NASDAQ',
            date: unixTimestampOld,
        },
    ];
    const dummyEODDataFromMarketStack: TickerEndOfDay[] = [
        {
            open: 150.0,
            high: 155.0,
            low: 145.0,
            close: 154.0,
            volume: 1000000,
            adj_high: 154.5,
            adj_low: 144.5,
            adj_close: 153.5,
            adj_open: 149.5,
            adj_volume: 950000,
            split_factor: 1.0,
            dividend: 0.5,
            symbol: 'AAPL',
            exchange: 'NASDAQ',
            date: unconvertedTimestamp,
        },
        {
            open: 151.0,
            high: 156.0,
            low: 146.0,
            close: 155.0,
            volume: 1050000,
            adj_high: 155.5,
            adj_low: 145.5,
            adj_close: 154.5,
            adj_open: 150.5,
            adj_volume: 955000,
            split_factor: 1.0,
            dividend: 0.6,
            symbol: 'AAPL',
            exchange: 'NASDAQ',
            date: unconvertedTimestampOld,
        },
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return recent data from the database', async () => {
        mockedGetLatestEODData.mockResolvedValueOnce(dummyEODDataFromDB);
        const result = await getEODDataForTicker('AAPL');
        expect(result).toEqual(dummyEODDataFromDB);
        expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should fetch data from MarketStack when no recent data is found in the database', async () => {
        mockedGetLatestEODData.mockResolvedValueOnce([]);
        mockedAxios.get.mockResolvedValueOnce({ data: { data: dummyEODDataFromMarketStack } });

        const result = await getEODDataForTicker('AAPL');
        expect(result).toEqual(dummyEODDataFromDB);
        expect(mockedAxios.get).toHaveBeenCalled();
        expect(mockedInsertEODData).toHaveBeenCalled();
    });

    it('should fetch data from MarketStack when old data is found in the database', async () => {
        const oldEODData: TickerEndOfDay[] = [
            {
                open: 130.0,
                high: 135.0,
                low: 125.0,
                close: 134.0,
                volume: 900000,
                adj_high: 134.5,
                adj_low: 124.5,
                adj_close: 133.5,
                adj_open: 129.5,
                adj_volume: 850000,
                split_factor: 1.0,
                dividend: 0.4,
                symbol: 'AAPL',
                exchange: 'NASDAQ',
                date: unixTimestampOld,
            },
        ];
        mockedGetLatestEODData.mockResolvedValueOnce(oldEODData);
        mockedAxios.get.mockResolvedValueOnce({ data: { data: dummyEODDataFromMarketStack } });

        const result = await getEODDataForTicker('AAPL');
        expect(result).toEqual(dummyEODDataFromDB);
        expect(mockedAxios.get).toHaveBeenCalled();
        expect(mockedInsertEODData).toHaveBeenCalled();
    });
});