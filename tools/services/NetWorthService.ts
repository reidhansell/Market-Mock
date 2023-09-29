import { executeQuery } from '../../database/queryExecutor';
import { getEODDataForTicker } from './EODDataService';
import User from '../../models/User';

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
                // Update the existing record
                await executeQuery('UPDATE User_Net_Worth SET net_worth = ? WHERE user_id = ? AND recorded_at = ?', [netWorth, user.user_id, today]);
            } else {
                // Insert a new record
                await executeQuery('INSERT INTO User_Net_Worth (user_id, net_worth, recorded_at) VALUES (?, ?, ?)', [user.user_id, netWorth, today]);
            }
        }
    } catch (error: any) {
        console.error(`Error calculating net worth: ${error.message}`);
    }
}
