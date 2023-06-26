const mysql = require('mysql');
const config = require('../config.json');

let databaseConnection = null;

async function initializeDatabaseConnection() {
    console.log("Initializing database connection.");
    return new Promise((resolve, reject) => {
        if (databaseConnection) {
            resolve(databaseConnection);
            return;
        }

        databaseConnection = mysql.createConnection({
            host: config.dbhostname,
            user: config.dbusername,
            password: config.dbpassword,
            database: config.dbname,
        });

        databaseConnection.connect((error) => {
            if (error) {
                console.error(`Error connecting to database: ${error.message}`);
                reject(error);
            } else {
                console.log('Database connection successful.');
                resolve(databaseConnection);
            }
        });
    });
}

function getDatabaseConnection() {
    if (!databaseConnection) {
        throw new Error('Database connection has not been initialized.');
    }
    return databaseConnection;
}

module.exports = {
    initializeDatabaseConnection,
    getDatabaseConnection,
};

