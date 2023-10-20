jest.mock('mysql');

import { initializeDatabaseConnection } from './databaseConnector';
import { createConnection } from 'mysql';

describe('Database Connection Module', () => {
    let mockConnection: any;

    beforeEach(() => {
        mockConnection = {
            connect: jest.fn(),
            end: jest.fn()
        };

        (createConnection as jest.MockedFunction<typeof createConnection>).mockReturnValue(mockConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize database connection successfully', async () => {
        mockConnection.connect.mockImplementationOnce((callback: (error: any) => void) => callback(null));

        await initializeDatabaseConnection();

        expect(mockConnection.connect).toHaveBeenCalled();
    });
});
