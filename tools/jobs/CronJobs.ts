import cron from 'node-cron';
import { cleanupExpiredTokens } from '../../database/queries/auth';
import { syncTickers } from '../services/tickersSyncService';
import ExpectedError from '../utils/ExpectedError';
import { calculateAndSaveUserNetWorth } from '../services/netWorthService';
import { fulfillOpenOrders } from '../services/orderFulfillmentService';

export default class CronJobs {
    public static scheduleJobs() {
        console.log('Scheduling cron jobs...');
        this.scheduleCleanupTokens();
        this.scheduleSyncTickers();
        this.scheduleCalculateNetWorth();
        this.scheduleFulfillOpenOrders();
        console.log('Successfully scheduled cron jobs');
    }

    private static async scheduleCleanupTokens() {
        console.log('Cleaning up expired tokens...');
        await cleanupExpiredTokens();
        console.log('Done cleaning up expired tokens');

        cron.schedule('0 1 * * *', this.wrapJob(async () => {
            console.log('Cleaning up expired tokens...');
            await cleanupExpiredTokens();
            console.log('Done cleaning up expired tokens');
        }));
    }

    private static async scheduleSyncTickers() {
        console.log('Syncing tickers...');
        await syncTickers();
        console.log('Done syncing tickers');

        cron.schedule('0 2 * * *', this.wrapJob(async () => {
            console.log('Syncing tickers...');
            await syncTickers();
            console.log('Done syncing tickers');
        }));
    }

    private static async scheduleCalculateNetWorth() {
        console.log('Calculating net worth...');
        await calculateAndSaveUserNetWorth();
        console.log('Done calculating net worth');

        cron.schedule('0 0 23 * *', this.wrapJob(async () => {
            console.log('Calculating net worth...');
            await calculateAndSaveUserNetWorth();
            console.log('Done calculating net worth');
        }));
    }

    private static async scheduleFulfillOpenOrders() {
        console.log('Fulfilling open orders...');
        await fulfillOpenOrders();
        console.log('Done fulfilling open orders');

        cron.schedule('*/5 * * * *', this.wrapJob(async () => {
            console.log('Fulfilling open orders...');
            await fulfillOpenOrders();
            console.log('Done fulfilling open orders');
        }));
    }

    private static wrapJob(job: Function) {
        return async () => {
            try {
                await job();
            } catch (error: any) {
                if (error instanceof ExpectedError) {
                    error.statusCode === 500 && console.error(error.devMessage);
                } else {
                    console.error(`Error in scheduled job: ${error.message}`);
                    console.log('Continuing...');
                }
            }
        };
    }

    public static stopAll() {
        console.log('Stopping all cron jobs...');
        cron.getTasks().forEach(task => task.stop());
        console.log('Successfully stopped all cron jobs');
    }
}
