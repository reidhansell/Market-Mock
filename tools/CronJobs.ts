import cron from 'node-cron';
import { cleanupExpiredTokens } from '../database/queries/auth';
import { syncTickers } from './tickersSyncService';
import ExpectedError from './ExpectedError';

export default class CronJobs {
    static scheduleJobs() {
        console.log('Scheduling cron jobs...');
        this.scheduleCleanupTokens();
        this.scheduleSyncTickers();
        console.log('Successfully scheduled cron jobs');
    }

    static async scheduleCleanupTokens() {
        console.log('Cleaning up expired tokens...');
        await cleanupExpiredTokens();
        console.log('Done cleaning up expired tokens');

        cron.schedule('0 1 * * *', this.wrapJob(async () => {
            console.log('Cleaning up expired tokens...');
            await cleanupExpiredTokens();
            console.log('Done cleaning up expired tokens');
        }));
    }

    static async scheduleSyncTickers() {
        console.log('Syncing tickers...');
        await syncTickers();
        console.log('Done syncing tickers');

        cron.schedule('0 2 * * *', this.wrapJob(async () => {
            console.log('Syncing tickers...');
            await syncTickers();
            console.log('Done syncing tickers');
        }));
    }

    static wrapJob(job: Function) {
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
}
