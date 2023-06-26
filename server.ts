const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const winston = require('winston');
const cron = require('node-cron');
const config = require('./config.json');
const { initializeDatabaseConnection } = require('./database/databaseConnector');
const { cleanupExpiredTokens } = require('./database/queries/auth');
const { syncTickers } = require('./tools/tickersSyncService');
const ExpectedError = require('./tools/ExpectedError');
const initializeDatabase = require('./database/databaseInitializer');

const port = config.port || 5000;

const initializeLogger = () => {
    console.log(`Initializing logger...`);
    const logger = winston.createLogger({
        transports: [
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/combined.log' })
        ],
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
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
    /*  CORS required when using npm run dev because the server and client are hosted separately  */
    app.use(cors({
        origin: config.clientURL,
        credentials: true
    }));
    app.use(express.json());
    app.use(cookieParser());

    /*  TODO add global auth middleware for protected routes   */

    /*  Serve static files from the React app in production */
    if (config.production) {
        app.use(express.static(path.join(__dirname, 'client/build')));

        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'client/build/index.html'));
        });
    }
    const requireRoutes = (dir, basePath = '/') => {
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

                app.use(fullRoutePath, routeHandler.router ? routeHandler.router : routeHandler);
            }
        });
    };

    const routesPath = path.join(__dirname, 'routes');
    requireRoutes(routesPath, '/api');

    /*  Error handling middleware   */
    app.use((error, req, res, next) => {
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
    } catch (error) {
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
    } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
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

module.exports = app;
