jest.mock('../queryExecutor', () => ({
    executeQuery: jest.fn()
}));

import { checkTickerExists } from './ticker';
import Ticker from '../../models/Ticker';
import { executeQuery } from '../queryExecutor';

describe('Ticker Functions', () => {

    describe('checkTickerExists', () => {

        it('should return ticker data if it exists', async () => {
            const mockSymbol = 'AAPL';
            const mockTicker: Ticker = {
                ticker_symbol: mockSymbol,
                company_name: 'Apple Inc.'
            };

            (executeQuery as jest.MockedFunction<typeof executeQuery>).mockResolvedValueOnce([mockTicker]);

            const result = await checkTickerExists(mockSymbol);

            expect(result).toEqual(mockTicker);
        });

        it('should return null if ticker does not exist', async () => {
            const mockSymbol = 'NONEXIST';

            (executeQuery as jest.MockedFunction<typeof executeQuery>).mockResolvedValueOnce([]);

            const result = await checkTickerExists(mockSymbol);

            expect(result).toBeNull();
        });

    });

});

afterEach(() => {
    jest.clearAllMocks();
});
