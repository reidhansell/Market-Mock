import cron from 'node-cron';
import { cleanupExpiredTokens } from '../../database/queries/auth';
import { syncTickers } from '../services/tickersSyncService';
import ExpectedError from '../utils/ExpectedError';
import { calculateAndSaveUserNetWorth } from '../services/netWorthService';
import { fulfillOpenOrders } from '../services/orderFulfillmentService';
import { insertHardwareLoadLog } from '../../database/queries/monitor';
import si from 'systeminformation';

export default class CronJobs {
    public static scheduleJobs() {
        console.log('Scheduling cron jobs...');
        this.scheduleCleanupTokens();
        this.scheduleSyncTickers();
        this.scheduleCalculateNetWorth();
        this.scheduleFulfillOpenOrders();
        this.scheduleHardwareDataCollection();
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

        cron.schedule('0 3 * * *', this.wrapJob(async () => {
            console.log('Calculating net worth...');
            await calculateAndSaveUserNetWorth();
            console.log('Done calculating net worth');
        }));
    }

    private static async scheduleFulfillOpenOrders() {
        console.log('Fulfilling open orders...');
        await fulfillOpenOrders();
        console.log('Done fulfilling open orders');

        cron.schedule('0 * * * *', this.wrapJob(async () => {
            console.log('Fulfilling open orders...');
            await fulfillOpenOrders();
            console.log('Done fulfilling open orders');
        }));
    }

    private static async scheduleHardwareDataCollection() {
        cron.schedule('*/5 * * * *', this.wrapJob(async () => {
            try {
                console.log('Collecting hardware data...');
                const load = await si.currentLoad();
                const cpuLoad = load.currentLoad;

                const mem = await si.mem();
                const memoryLoad = (mem.active / mem.total) * 100;

                const disks = await si.fsSize();
                let diskUsage = 0;
                if (disks.length > 0) {
                    const totalSize = disks.reduce((acc, disk) => acc + disk.size, 0);
                    const usedSize = disks.reduce((acc, disk) => acc + disk.used, 0);
                    diskUsage = (usedSize / totalSize) * 100;
                }

                console.log(`CPU Load: ${cpuLoad}%`);
                console.log(`Memory Load: ${memoryLoad}%`);
                console.log(`Disk Usage: ${diskUsage.toFixed(2)}%`);

                await insertHardwareLoadLog(cpuLoad, memoryLoad, diskUsage);
            } catch (error) {
                console.error(`Error getting system load: ${error}`);
            }
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
