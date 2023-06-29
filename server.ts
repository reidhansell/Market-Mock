import express from 'express';
import config from './config.json';
import { initializeDatabaseConnection } from './database/DatabaseConnector';
import initializeDatabase from './database/DatabaseInitializer';
import Logger from './tools/Logger';
import Router from './tools/Router';
import CronJobs from './tools/CronJobs';

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

