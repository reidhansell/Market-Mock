import { Router, Request, Response, NextFunction } from 'express';
import { getStockTransactions, getUserNetWorthData, getUserStocks } from '../database/queries/portfolio';
import { authenticateToken } from '../tools/middleware/authMiddleware';
import { getIntradayDataForTicker } from '../tools/services/intradayService';
import { UserStockWithPrices } from '../models/UserStock';

interface AuthenticatedRequest extends Request {
    user: {
        user_id: number;
    }
}

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id } = (req as AuthenticatedRequest).user;
        const netWorthData = await getUserNetWorthData(user_id);
        const userStocks = await getUserStocks(user_id) as UserStockWithPrices[]; // Cast to UserStockWithPrices[] to add last, open, and purchased_price
        for (const userStock of userStocks) {
            const intradayData = await getIntradayDataForTicker(userStock.ticker_symbol);
            userStock.last = intradayData[0].last;
            userStock.open = intradayData[0].open;

            const stockTransactions = await getStockTransactions(user_id, userStock.ticker_symbol);
            let purchasedShares = 0;
            let costBasis = 0;

            for (const transaction of stockTransactions) { // DANGER: Big O of N^2
                if (purchasedShares < userStock.quantity) {
                    const sharesToConsider = Math.min(transaction.quantity, userStock.quantity - purchasedShares);

                    costBasis += sharesToConsider * transaction.price_per_share;
                    purchasedShares += sharesToConsider;
                } else {
                    break;
                }
            }
            userStock.purchased_price = costBasis / purchasedShares;
        }
        return res.json({ netWorthData: netWorthData, userStocks: userStocks });
    } catch (error) {
        next(error);
    }
});

export default router;
