jest.mock('./queryExecutor');

import initializeDatabase from './databaseInitializer';
import { executeQuery } from './queryExecutor';
import quests from './quests.json';

describe('Database Initialization', () => {
    beforeEach(() => {
        (executeQuery as jest.MockedFunction<typeof executeQuery>).mockResolvedValue([]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize database and insert quests', async () => {
        await initializeDatabase();

        expect(executeQuery).toHaveBeenCalledTimes(quests.length + 16 + 1);
        for (const quest of quests) {
            expect(executeQuery).toHaveBeenCalledWith('INSERT INTO Quest (name, description) VALUES (?, ?)', [quest.name, quest.description]);
        }
    });
});