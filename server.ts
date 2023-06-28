import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createLogger, transports, format } from 'winston';
import cron from 'node-cron';
import config from './config.json';
import { initializeDatabaseConnection } from './database/databaseConnector';
import { cleanupExpiredTokens } from './database/queries/auth';
import { syncTickers } from './tools/tickersSyncService';
import ExpectedError from './tools/ExpectedError';
import initializeDatabase from './database/databaseInitializer';

const app = express();
const port = config.port;

const initializeLogger = () => {
    console.log(`Initializing logger...`);
    const logger = createLogger({
        transports: [
            new transports.File({ filename: 'logs/error.log', level: 'error' }),
            new transports.File({ filename: 'logs/combined.log' })
        ],
        format: format.combine(
            format.timestamp(),
            format.json()
        )
    });

    const originalConsoleLog = console.log;
    console.log = function (msg) {
        originalConsoleLog(msg);
        logger.info(msg);
    };

    const originalConsoleError = console.error;
    console.error = function (msg) {
        originalConsoleError(msg);
        logger.error(msg);
    };
    console.log(`Successfully initialized logger`);
}

const initializeRoutes = () => {
    console.log(`Initializing routes...`);
    app.use(cors({
        origin: config.clientURL,
        credentials: true
    }));
    app.use(express.json());
    app.use(cookieParser());

    if (config.production) {
        app.use(express.static(path.join(__dirname, 'client/build')));

        app.get('*', (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, 'client/build/index.html'));
        });
    }
    const requireRoutes = (dir: string, basePath = '/') => {
        const files = fs.readdirSync(dir);

        files.forEach((file) => {
            const filePath = path.join(dir, file);
            const stat = fs.lstatSync(filePath);

            if (stat.isDirectory()) {
                const subDirectory = path.join(basePath, file);
                requireRoutes(filePath, subDirectory);
            } else {
                const routePath = path.parse(file).name;
                const routeHandler = require(filePath);
                let fullRoutePath = path.join(basePath, routePath);

                fullRoutePath = fullRoutePath.replace(/\\/g, '/');

                app.use(fullRoutePath, routeHandler.default);
            }
        });
    };

    const routesPath = path.join(__dirname, 'routes');
    requireRoutes(routesPath, '/api');

    app.use((error: any, req: Request, res: Response, next: NextFunction) => {
        if (error instanceof ExpectedError) {
            if (error.statusCode === 500) {
                console.error(error.devMessage);
            }
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        else {
            console.error(`An unexpected error occurred:\n${JSON.stringify({ error: error.message, url: req.originalUrl, body: req.body })}`);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    console.log(`Successfully initialized routes`);
}

async function initialize() {
    console.log('Beginning initialization...');

    initializeLogger();
    initializeRoutes();

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    await initializeDatabaseConnection();
    await initializeDatabase();

    console.log(`Cleaning up expired tokens...`)
    try {
        await cleanupExpiredTokens();
    } catch (error: any) {
        if (error instanceof ExpectedError) {
            error.statusCode === 500 ? console.error(error.devMessage) : null;
        }
        else {
            console.error(`Error cleaning up expired tokens: ${error.message}`);
        }
        console.log('Continuing...')
    }
    console.log(`Successfully cleaned up expired tokens`);
    try {
        await syncTickers();
    } catch (error: any) {
        if (error instanceof ExpectedError) {
            error.statusCode === 500 ? console.error(error.devMessage) : null;
        }
        else {
            console.error(`Error fetching and processing tickers: ${error.message}`);
        }
        console.log('Continuing...')
    }
    console.log(`Scheduling cron jobs...`)
    cron.schedule('0 1 * * *', async () => {
        try {
            console.log('Cleaning up expired tokens...')
            await cleanupExpiredTokens();
            console.log("Done cleaning up expired tokens")
        } catch (error: any) {
            if (error instanceof ExpectedError) {
                error.statusCode === 500 ? console.error(error.devMessage) : null;
            }
            else {
                console.error(`Error cleaning up expired tokens: ${error.message}`);
                console.log('Continuing...')
            }

        }
    });

    cron.schedule('0 2 * * *', async () => {
        try {
            await syncTickers();
        } catch (error: any) {
            if (error instanceof ExpectedError) {
                error.statusCode === 500 ? console.error(error.devMessage) : null;
            }
            else {
                console.error(`Error fetching and processing tickers: ${error.message}`);
                console.log('Continuing...')
            }

        }
    });
    console.log(`Successfully scheduled cron jobs`);
    console.log(`Initialization successful`);
}

initialize();

export default app;
