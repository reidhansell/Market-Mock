import express from 'express';
import config from './config.json';
import { initializeDatabaseConnection } from './database/databaseConnector';
import initializeDatabase from './database/databaseInitializer';
import Logger from './tools/utils/Logger';
import Router from './tools/utils/Router';
import CronJobs from './tools/jobs/CronJobs';

const app = express();
const port = config.port;

async function initialize() {
    console.log('Beginning initialization...');

    Logger.initialize();
    Router.initialize(app);

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    await initializeDatabaseConnection();
    await initializeDatabase();

    CronJobs.scheduleJobs();

    console.log('Initialization successful');
}

initialize();

export default app;

