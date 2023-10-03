import { executeQuery } from '../../database/queryExecutor';
import { getEODDataForTicker } from './EODDataService';
import User from '../../models/User';
import { getQuests, updateQuest } from '../../database/queries/quests';
import Transaction from '../../models/Transaction';

async function heldStockFor30Days(userstocks: Array<{ ticker_symbol: string, quantity: number }>, user_id: number): Promise<boolean> {
    for (const stock of userstocks) {
        const buyQuery = `SELECT * 
        FROM Transaction AS t1 
        JOIN \`Order\` AS o1 ON t1.order_id = o1.order_id
        WHERE t1.ticker_symbol = ? 
        AND o1.quantity > 0 
        AND t1.transaction_date < DATE_SUB(NOW(), INTERVAL 30 DAY) 
        AND NOT EXISTS (
            SELECT 1 
            FROM Transaction AS t2 
            JOIN \`Order\` AS o2 ON t2.order_id = o2.order_id
            WHERE t2.ticker_symbol = t1.ticker_symbol 
            AND o2.quantity < 0 
            AND t2.transaction_date BETWEEN t1.transaction_date AND DATE_ADD(t1.transaction_date, INTERVAL 30 DAY) 
            AND t2.user_id = ?
        ) 
        AND t1.user_id = ?;`;
        const buyResults = await executeQuery(buyQuery, [stock.ticker_symbol, user_id]) as Transaction[];

        if (buyResults.length > 0) {
            return true
        }
    }
    return false;
}


export async function calculateAndSaveUserNetWorth(userId?: number) {
    try {
        let users = [];

        if (userId) {
            users = await executeQuery('SELECT user_id, current_balance FROM User WHERE user_id = ?', [userId]) as User[];
        } else {
            users = await executeQuery('SELECT user_id, current_balance FROM User') as User[];
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to midnight

        for (const user of users) {
            let totalStockWorth = 0;

            const userStocks = await executeQuery('SELECT ticker_symbol, quantity FROM User_Stocks WHERE user_id = ?', [user.user_id]) as Array<{ ticker_symbol: string, quantity: number }>;
            for (const stock of userStocks) {
                const eodData = await getEODDataForTicker(stock.ticker_symbol);
                if (eodData && eodData[0].close) {
                    totalStockWorth += eodData[0].close * stock.quantity;
                }
            }

            const netWorth = user.current_balance + totalStockWorth;

            const existingRecords = await executeQuery('SELECT * FROM User_Net_Worth WHERE user_id = ? AND recorded_at = ?', [user.user_id, today]) as [];

            if (existingRecords.length > 0) {
                await executeQuery('UPDATE User_Net_Worth SET net_worth = ? WHERE user_id = ? AND recorded_at = ?', [netWorth, user.user_id, today]);
            } else {
                await executeQuery('INSERT INTO User_Net_Worth (user_id, net_worth, recorded_at) VALUES (?, ?, ?)', [user.user_id, netWorth, today]);
            }
            const quests = await getQuests(user.user_id);
            const doubleNetWorthQuest = quests.find(quest => quest.name === 'Double your money');
            const diamondHandsQuest = quests.find(quest => quest.name === 'Diamond hands');

            if (doubleNetWorthQuest && netWorth >= user.current_balance * 2 && doubleNetWorthQuest.completion_date === null) {
                await updateQuest(user.user_id, doubleNetWorthQuest.quest_id);
            }

            if (diamondHandsQuest && diamondHandsQuest.completion_date === null && await heldStockFor30Days(userStocks, user.user_id)) {
                await updateQuest(user.user_id, diamondHandsQuest.quest_id);
            }
        }
    } catch (error: any) {
        console.error(`Error calculating net worth: ${error.message}`);
    }
}
