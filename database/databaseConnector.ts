import * as mysql from 'mysql';
import config from '../config.json';

let databaseConnection: mysql.Connection | null = null;

async function initializeDatabaseConnection(): Promise<mysql.Connection> {
    console.log("Initializing database connection.");
    if (databaseConnection) {
        return Promise.resolve(databaseConnection);
    }

    return new Promise((resolve, reject) => {
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
                resolve(databaseConnection as mysql.Connection);
            }
        });
    });
}

async function getDatabaseConnection(): Promise<mysql.Connection> {
    if (!databaseConnection) {
        throw new Error('Database connection has not been initialized.');
    }
    return databaseConnection;
}

export {
    initializeDatabaseConnection,
    getDatabaseConnection,
};