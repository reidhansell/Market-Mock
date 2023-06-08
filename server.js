const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const cors = require('cors');
const dbManager = require('./databaseManager'); // To initialize
const config = require('./config.json');
const { cleanupExpiredTokens } = require('./queries/auth')

const port = config.port || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the React app in production
if (config.production) {
    app.use(express.static(path.join(__dirname, 'client/build')));

    // "catchall" handler for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname + '/client/build/index.html'));
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
requireRoutes(routesPath, '/api/');

// Periodically clean up refresh tokens
setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
