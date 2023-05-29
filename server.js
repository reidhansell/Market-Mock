const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const path = require('path');
const mysql = require('mysql');
const config = require('./config.json');

const connection = mysql.createConnection({
    host: config.dbhostname,
    user: config.dbusername,
    password: config.dbpassword,
    database: config.dbname
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to Db', err);
        process.exit(1); // Exit the process with a "failure" code
    }
    console.log('Connection established');
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// "catchall" handler for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

/* Example route
app.get('/api', (req, res) => {
    res.send('Hello World from API!');
});
*/

/* Example query
connection.query('SELECT * FROM my_table', (err, rows) => {
  if(err) throw err;

  console.log('Data received from Db:\n');
  console.log(rows);
});
*/

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
