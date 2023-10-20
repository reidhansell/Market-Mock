jest.mock('./databaseConnector');

import { executeQuery } from './queryExecutor';
import { getDatabaseConnection } from './databaseConnector';
import { Connection } from 'mysql';

const mockQuery = jest.fn();

const mockConnection: Connection = {
    query: mockQuery,
} as unknown as Connection;

(getDatabaseConnection as jest.Mock).mockResolvedValue(mockConnection);

describe('executeQuery Function', () => {

    beforeEach(() => {
        mockQuery.mockClear();
    });

    it('should execute a query without errors', async () => {
        mockQuery.mockImplementation((query, params, callback) => callback(null, []));

        const result = await executeQuery('SELECT * FROM test');

        expect(result).toEqual([]);
        expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM test', [], expect.anything());
    });
});
