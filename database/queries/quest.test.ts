jest.mock('../queryExecutor', () => ({
    executeQuery: jest.fn()
}));

import { executeQuery } from '../queryExecutor';
import { getQuests } from './quests';

afterEach(() => {
    jest.clearAllMocks();
});

describe('Quest Functions', () => {

    describe('getQuests', () => {

        it('should return quests for a valid user', async () => {
            const userId = 1;

            const mockQuests = [
                {
                    quest_id: 1,
                    name: "Quest 1",
                    description: "Description 1",
                    completion_date: null
                },
                {
                    quest_id: 2,
                    name: "Quest 2",
                    description: "Description 2",
                    completion_date: "2023-01-01"
                }
            ];

            (executeQuery as jest.MockedFunction<typeof executeQuery>).mockResolvedValueOnce(mockQuests);

            const result = await getQuests(userId);

            expect(result).toEqual(mockQuests);
        });
    });
});


