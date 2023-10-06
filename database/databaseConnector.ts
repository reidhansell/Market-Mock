import { Connection, createConnection, createPool, Pool } from 'mysql';
import config from '../config.json';

let databaseConnection: Connection | null = null;
let transactionPool: Pool;

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
                initializeTransactionPool();
                resolve(databaseConnection as Connection);
            }
        });
    });
}

function initializeTransactionPool(): void {
    console.log("Initializing transaction pool.");
    transactionPool = createPool({
        host: config.dbhostname,
        user: config.dbusername,
        password: config.dbpassword,
        database: config.dbname,
        connectionLimit: 10,
    });
    console.log('Transaction pool created.');
}

function getDatabaseConnection(): Connection {
    if (!databaseConnection) {
        throw new Error('Database connection has not been initialized.');
    }
    return databaseConnection;
}

function getTransactionConnection(): Promise<Connection> {
    return new Promise((resolve, reject) => {
        transactionPool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        });
    });
}

function closeDatabaseConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!databaseConnection) {
            reject(new Error('Database connection has not been initialized.'));
        } else {
            databaseConnection.end((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        }
    });
}

function closeTransactionPool(): Promise<void> {
    return new Promise((resolve, reject) => {
        transactionPool.end((error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

export {
    initializeDatabaseConnection,
    getDatabaseConnection,
    getTransactionConnection,
    closeDatabaseConnection,
    closeTransactionPool,
};
