import express from 'express';
import { port } from './config.json';
import { initializeDatabaseConnection, closeDatabaseConnection, closeTransactionPool } from './database/databaseConnector';
import initializeDatabase from './database/databaseInitializer';
import Logger from './tools/utils/Logger';
import Router from './tools/utils/Router';
import CronJobs from './tools/jobs/CronJobs';

const app = express();

async function initialize() {
    try {
        console.log('Beginning initialization...');

        Logger.initialize();
        Router.initialize(app);

        /* await: Cron jobs depend on DB */
        await initializeDatabaseConnection();
        await initializeDatabase();

        CronJobs.scheduleJobs();

        const server = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

        console.log('Initialization successful');

        return server;
    } catch (error) {
        console.log('Initialization failed with the following error');
        console.log(error);
    }
}

(async () => {
    const server = process.env.NODE_ENV !== 'test' ? await initialize() as any : null;

    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(async () => {
            console.log('HTTP server closed');
            CronJobs.stopAll();
            console.log('Cron jobs stopped');
            await closeDatabaseConnection();
            await closeTransactionPool();
            console.log('Database connection closed');
            process.exit(0);
        });
    });

})();

export default app;