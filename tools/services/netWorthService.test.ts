jest.mock('./intradayService');
jest.mock('../../database/queries/quests');
jest.mock('../../database/queries/order');
jest.mock('../../database/queries/portfolio');
jest.mock('../../database/databaseConnector')

import { calculateAndSaveUserNetWorth } from './netWorthService';
import { getIntradayDataForTicker } from './intradayService';
import { getQuests, updateQuest } from '../../database/queries/quests';
import { fetchBuyTransactionsHeldFor30Days } from '../../database/queries/order';
import { getUserBalance, getAllUserBalances, getUserNetWorth, insertUserNetWorth, getUserStocks, updateUserNetWorth } from '../../database/queries/portfolio';
import { UserQuestUnchecked } from '../../models/Quest';


describe('netWorthService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should calculate and save user net worth for a specific user', async () => {
        (getUserBalance as jest.Mock).mockResolvedValue({ current_balance: 100, starting_amount: 50 });
        (getUserStocks as jest.Mock).mockResolvedValue([{ ticker_symbol: 'TICK', quantity: 5 }]);
        (getIntradayDataForTicker as jest.Mock).mockResolvedValue([{ last: 10 }]);
        (getUserNetWorth as jest.Mock).mockResolvedValue([]);
        (insertUserNetWorth as jest.Mock).mockResolvedValue(undefined);
        (fetchBuyTransactionsHeldFor30Days as jest.Mock).mockResolvedValue([{}]);
        (getQuests as jest.Mock).mockResolvedValue([
            { name: 'Double your money', quest_id: 1, completion_date: null, description: "Placeholder" },
            { name: 'Diamond hands', quest_id: 2, completion_date: null, description: "Placeholder" }
        ] as UserQuestUnchecked[]);
        (updateQuest as jest.Mock).mockResolvedValue(undefined);
        (updateUserNetWorth as jest.Mock).mockResolvedValue(undefined);

        await calculateAndSaveUserNetWorth(1);

        expect(getUserBalance).toHaveBeenCalledWith(1);
        expect(getIntradayDataForTicker).toHaveBeenCalledWith('TICK');
        expect(insertUserNetWorth).toHaveBeenCalled();
    });

    it('should handle quests when conditions are met', async () => {
        (getUserBalance as jest.Mock).mockResolvedValue({ current_balance: 100, starting_amount: 50 });
        (getAllUserBalances as jest.Mock).mockResolvedValue([{ user_id: 1, current_balance: 100, starting_amount: 50 }]);
        (getUserStocks as jest.Mock).mockResolvedValue([{ ticker_symbol: 'TICK', quantity: 5 }]);
        (getIntradayDataForTicker as jest.Mock).mockResolvedValue([{ last: 10 }]);
        (getUserNetWorth as jest.Mock).mockResolvedValue([]);
        (fetchBuyTransactionsHeldFor30Days as jest.Mock).mockResolvedValue([{}]);
        (getQuests as jest.Mock).mockResolvedValue([
            { name: 'Double your money', quest_id: 1, completion_date: null, description: "Placeholder" },
            { name: 'Diamond hands', quest_id: 2, completion_date: null, description: "Placeholder" }
        ] as UserQuestUnchecked[]);
        (updateQuest as jest.Mock).mockResolvedValue(undefined);
        (updateUserNetWorth as jest.Mock).mockResolvedValue(undefined);
        (insertUserNetWorth as jest.Mock).mockResolvedValue(undefined);

        await calculateAndSaveUserNetWorth();

        expect(updateQuest).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully', async () => {
        (getAllUserBalances as jest.Mock).mockRejectedValue(new Error('Database Error'));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        await calculateAndSaveUserNetWorth();

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error calculating net worth: Database Error');
        consoleErrorSpy.mockRestore();
    });
});

