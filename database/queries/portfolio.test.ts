jest.mock('../queryExecutor', () => ({
    executeQuery: jest.fn()
}));

import * as databaseFunctions from './portfolio';
import { executeQuery } from '../queryExecutor';

afterEach(() => {
    jest.clearAllMocks();
});

describe('Database Functions', () => {

    describe('getUserNetWorthData', () => {

        it('should return net worth data for a valid user', async () => {
            const userId = 1;

            const mockNetWorthData = [
                { user_id: userId, recorded_at: 1672134086, net_worth: 5000 },
                { user_id: userId, recorded_at: 1672047686, net_worth: 4800 }
            ];

            (executeQuery as jest.MockedFunction<typeof executeQuery>).mockResolvedValueOnce(mockNetWorthData);

            const result = await databaseFunctions.getUserNetWorthData(userId);

            expect(result).toEqual(mockNetWorthData);
        });
    });
});


