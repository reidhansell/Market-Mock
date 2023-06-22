const mysql = require('mysql');
const config = require('./config.json');
const util = require('util');

const connection = mysql.createConnection({
    host: config.dbhostname,
    user: config.dbusername,
    password: config.dbpassword,
    database: config.dbname,
});

// This will allow the use of `await connection.query()`
connection.query = util.promisify(connection.query).bind(connection);

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to database: ", err);
        process.exit(1);
    }

    console.log("Database connected!");

    const dropTables = async () => {
        try {
            connection.query('SET FOREIGN_KEY_CHECKS = 0');
            connection.query('DROP TABLE IF EXISTS Refresh_Tokens, User_Reset, Orders, Watch_List, Transactions, Users, Stock_Data, Tickers');
            connection.query('SET FOREIGN_KEY_CHECKS = 1');
            console.log('Tables dropped successfully.');
        } catch (error) {
            console.error('Error dropping tables', error);
            throw new Error('Error dropping tables');
        }
    };

    //if (!config.production) { dropTables(); } //FIXME MAKE SURE THIS IS REMOVED AND MODULARIZED BEFORE PRODUCTION

    const table_definitions = [
        `CREATE TABLE IF NOT EXISTS Tickers (
            ticker_symbol VARCHAR(15) PRIMARY KEY,
            company_name VARCHAR(255)
        )`,
        `CREATE TABLE IF NOT EXISTS Stock_Data (
            stock_id INT AUTO_INCREMENT PRIMARY KEY,
            ticker_symbol VARCHAR(15),
            current_price DECIMAL(8, 2),
            previous_close DECIMAL(8, 2),
            open_price DECIMAL(8, 2),
            high_price DECIMAL(8, 2),
            low_price DECIMAL(8, 2),
            volume INT,
            market_cap DECIMAL(20, 2),
            PE_ratio DECIMAL(8, 2),
            dividend_yield DECIMAL(8, 2),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticker_symbol) REFERENCES Tickers(ticker_symbol)
        )`,
        `CREATE TABLE IF NOT EXISTS Users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50),
            email VARCHAR(255),
            password VARCHAR(255),
            registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            starting_amount DECIMAL(15, 2) DEFAULT 10000.00,
            current_balance DECIMAL(15, 2) DEFAULT 10000.00,
            is_email_verified BOOLEAN DEFAULT false,
            verification_token VARCHAR(255)
        )`,
        `CREATE TABLE IF NOT EXISTS Transactions (
            transaction_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            ticker_symbol VARCHAR(15),
            transaction_type VARCHAR(4),
            quantity INT,
            price_per_share DECIMAL(8, 2),
            transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (ticker_symbol) REFERENCES Tickers(ticker_symbol)
        )`,
        `CREATE TABLE IF NOT EXISTS Watch_List (
            watch_list_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            ticker_symbol VARCHAR(15),
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (ticker_symbol) REFERENCES Tickers(ticker_symbol)
        )`,
        `CREATE TABLE IF NOT EXISTS Orders (
            order_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            ticker_symbol VARCHAR(15),
            order_type VARCHAR(10),
            trigger_price DECIMAL(8, 2),
            quantity INT,
            fulfilled BOOLEAN DEFAULT FALSE,
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (ticker_symbol) REFERENCES Tickers(ticker_symbol)
        )`,
        `CREATE TABLE IF NOT EXISTS User_Reset (
            reset_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            starting_amount DECIMAL(15, 2),
            end_amount DECIMAL(15, 2),
            reset_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Refresh_Tokens (
            token_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            token VARCHAR(255),
            expiry_date TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )`
    ];

    for (const table_definition of table_definitions) {
        connection.query(table_definition, (err) => {
            if (err) {
                console.error("Error creating table: ", err);
                process.exit(1);
            }
            console.log(`Table ${table_definition.split(' ')[5]} created`);
        });
    }
});

module.exports = connection;
