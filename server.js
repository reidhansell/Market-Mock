const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbManager = require('./databaseManager'); // To initialize
const config = require('./config.json');
const { cleanupExpiredTokens } = require('./queries/auth');
const winston = require('winston');
const cron = require('node-cron');
const { fetchAndSaveTickers } = require('./queries/ticker');

const port = config.port || 5000;

// Configure Winston logger
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
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

// Serve static files from the React app in production
if (config.production) {
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build/index.html'));
    });
}

// Middleware
app.use(cors({
    origin: config.serverURL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use((err, req, res, next) => {
    console.error({ message: err.message, stack: err.stack, url: req.originalUrl, body: req.body });
    const errorMessage = err.message || 'Internal Server Error';
    res.status(err.status || 500).json({ error: errorMessage });
});

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

cleanupExpiredTokens();
fetchAndSaveTickers();
cron.schedule('0 1 * * *', cleanupExpiredTokens);
cron.schedule('0 2 * * *', fetchAndSaveTickers);

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

module.exports = app;

