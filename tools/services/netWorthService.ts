import { getIntradayDataForTicker } from './intradayService';
import { getQuests, updateQuest } from '../../database/queries/quests';
import { fetchBuyTransactionsHeldFor30Days } from '../../database/queries/order';
import UserStock from '../../models/UserStock';
import { getUserBalance, getAllUserBalances, getUserNetWorth, updateUserNetWorth, insertUserNetWorth, getUserStocks } from '../../database/queries/portfolio';

async function heldStockFor30Days(userStocks: Array<{ ticker_symbol: string, quantity: number }>, userId: number): Promise<boolean> {
    for (const stock of userStocks) {
        const buyResults = await fetchBuyTransactionsHeldFor30Days(stock.ticker_symbol, userId);
        if (buyResults.length > 0) {
            return true;
        }
    }
    return false;
}

async function fetchUserWallets(userId?: number): Promise<{ user_id: number, current_balance: number, starting_amount: number }[]> {
    if (userId) {
        return [{ user_id: userId, ...await getUserBalance(userId) }];
    }
    return await getAllUserBalances();
}

async function calculateStockWorth(userStocks: UserStock[]): Promise<number> {
    let totalStockWorth = 0;
    for (const stock of userStocks) {
        //TODO if price is 0?
        const eodData = await getIntradayDataForTicker(stock.ticker_symbol);
        if (eodData && eodData[0].close) {
            totalStockWorth += parseFloat((eodData[0].last * stock.quantity).toFixed(2));
        }
    }
    return totalStockWorth;
}

async function updateOrInsertUserNetWorth(userId: number, netWorth: number, today: number) {
    const results = await getUserNetWorth(userId, today);
    if (results.length > 0) {
        await updateUserNetWorth(userId, netWorth, today);
    } else {
        await insertUserNetWorth(userId, netWorth, today);
    }
}

export async function calculateAndSaveUserNetWorth(userId?: number) {
    try {
        const users = await fetchUserWallets(userId);
        const today = Math.floor(new Date().getTime() / 1000);

        for (const user of users) {
            const userStocks = await getUserStocks(user.user_id);
            const totalStockWorth = await calculateStockWorth(userStocks);
            const netWorth = user.current_balance + totalStockWorth;
            await updateOrInsertUserNetWorth(user.user_id, netWorth, today);

            const quests = await getQuests(user.user_id);
            const doubleNetWorthQuest = quests.find(quest => quest.name === 'Double your money');
            const diamondHandsQuest = quests.find(quest => quest.name === 'Diamond hands');

            if (doubleNetWorthQuest && netWorth >= parseFloat((user.starting_amount * 2).toFixed(2)) && !doubleNetWorthQuest.completion_date) {
                await updateQuest(user.user_id, doubleNetWorthQuest.quest_id);
            }

            if (diamondHandsQuest && !diamondHandsQuest.completion_date && await heldStockFor30Days(userStocks, user.user_id)) {
                await updateQuest(user.user_id, diamondHandsQuest.quest_id);
            }
        }
    } catch (error: any) {
        console.error(`Error calculating net worth: ${error.message}`);
    }
}
