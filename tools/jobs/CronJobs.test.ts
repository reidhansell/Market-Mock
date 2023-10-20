jest.mock('node-cron');
jest.mock('../../database/queries/auth');
jest.mock('../services/tickersSyncService');
jest.mock('../services/netWorthService');
jest.mock('../services/orderFulfillmentService');

import cron from 'node-cron';
import CronJobs from './CronJobs';
import { cleanupExpiredTokens } from '../../database/queries/auth';
import { syncTickers } from '../services/tickersSyncService';
import { calculateAndSaveUserNetWorth } from '../services/netWorthService';
import { fulfillOpenOrders } from '../services/orderFulfillmentService';

(cleanupExpiredTokens as jest.Mock).mockResolvedValue(undefined);
(syncTickers as jest.Mock).mockResolvedValue(undefined);
(calculateAndSaveUserNetWorth as jest.Mock).mockResolvedValue(undefined);
(fulfillOpenOrders as jest.Mock).mockResolvedValue(undefined);
(cron.getTasks as jest.Mock).mockReturnValue([{ stop: jest.fn() }, { stop: jest.fn() }, { stop: jest.fn() }, { stop: jest.fn() }]);

describe('CronJobs', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should schedule all jobs', () => {
        CronJobs.scheduleJobs();
        expect(cleanupExpiredTokens).toHaveBeenCalledTimes(1);
        expect(syncTickers).toHaveBeenCalledTimes(1);
        expect(calculateAndSaveUserNetWorth).toHaveBeenCalledTimes(1);
        expect(fulfillOpenOrders).toHaveBeenCalledTimes(1);
    });

    it('should stop all cron jobs', () => {
        CronJobs.stopAll();

        const tasks = cron.getTasks();
        tasks.forEach(task => {
            expect(task.stop).toHaveBeenCalled();
        });
    });
});

