import { executeQuery } from '../../database/queryExecutor';
import { getEODDataForTicker } from './EODDataService';

export async function calculateAndSaveUserNetWorth() {
    try {
        const users = await executeQuery('SELECT user_id, current_balance FROM User') as Array<{ user_id: number, current_balance: number }>;
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
            await executeQuery('INSERT INTO User_Net_Worth (user_id, net_worth) VALUES (?, ?)', [user.user_id, netWorth]);
        }
    } catch (error: any) {
        console.error(`Error calculating net worth: ${error.message}`);
    }
}
