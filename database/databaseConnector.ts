import { Connection, createConnection } from 'mysql';
import config from '../config.json';

let databaseConnection: Connection | null = null;

async function initializeDatabaseConnection(): Promise<Connection> {
    console.log("Initializing database connection.");
    if (databaseConnection) {
        return databaseConnection;
    }

    return new Promise((resolve, reject) => {
        databaseConnection = createConnection({
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
                resolve(databaseConnection as Connection);
            }
        });
    });
}

function getDatabaseConnection(): Connection {
    if (!databaseConnection) {
        throw new Error('Database connection has not been initialized.');
    }
    return databaseConnection;
}

export {
    initializeDatabaseConnection,
    getDatabaseConnection,
};