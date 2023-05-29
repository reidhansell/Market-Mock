const express = require('express');
const app = express();
const path = require('path');
const dbManager = require('./databaseManager');
const config = require('./config.json');

dbManager.createTables();

const port = config.port || 5000;

// Serve static files from the React app
if (config.production) {
    app.use(express.static(path.join(__dirname, 'client/build')));

    // "catchall" handler for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname + '/client/build/index.html'));
    });
}

/* Example route
app.get('/api', (req, res) => {
    res.send('Hello World from API!');
});
*/

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
