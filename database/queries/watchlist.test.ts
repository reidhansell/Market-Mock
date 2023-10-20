jest.mock('../queryExecutor', () => ({
    executeQuery: jest.fn()
}));

import { getWatchList, addTickerToWatchList, removeTickerFromWatchList } from './watchlist';
import WatchList from '../../models/WatchList';
import { executeQuery } from '../queryExecutor';

afterEach(() => {
    jest.clearAllMocks();
});

describe('WatchList Functions', () => {

    describe('getWatchList', () => {

        it('should return a user\'s watchlist', async () => {
            const mockUserId = 1;
            const mockWatchList: WatchList[] = [
                { ticker_symbol: 'AAPL', company_name: 'Apple Inc.' },
                { ticker_symbol: 'GOOGL', company_name: 'Alphabet Inc.' }
            ];

            (executeQuery as jest.MockedFunction<typeof executeQuery>).mockResolvedValueOnce(mockWatchList);

            const result = await getWatchList(mockUserId);
            expect(result).toEqual(mockWatchList);
        });
    });

    describe('addTickerToWatchList', () => {

        it('should add a ticker to user\'s watchlist', async () => {
            const mockUserId = 1;
            const mockTickerSymbol = 'AAPL';

            await addTickerToWatchList(mockUserId, mockTickerSymbol);
            expect(executeQuery).toHaveBeenCalledWith(expect.any(String), [mockUserId, mockTickerSymbol]);
        });
    });

    describe('removeTickerFromWatchList', () => {

        it('should remove a ticker from user\'s watchlist', async () => {
            const mockUserId = 1;
            const mockTickerSymbol = 'AAPL';

            await removeTickerFromWatchList(mockUserId, mockTickerSymbol);
            expect(executeQuery).toHaveBeenCalledWith(expect.any(String), [mockUserId, mockTickerSymbol]);
        });

    });

});
