import { executeQuery } from './QueryExecutor';
import config from '../config.json';

async function initializeDatabase(): Promise<void> {
    try {
        /*  TODO Remove this code before deploying to production    
        console.log("Beginning database initialization.");
        if (!config.production) {
            console.log("Dropping tables");
            await executeQuery('SET FOREIGN_KEY_CHECKS = 0');
            await executeQuery('DROP TABLE IF EXISTS Refresh_Token, User_Reset, Trade_Order, Watch_List, Transaction, User, Ticker_End_Of_Day, Ticker_Intraday, Ticker');
            await executeQuery('SET FOREIGN_KEY_CHECKS = 1');
            console.log('Tables dropped successfully.');
        }
          End of code to remove before deploying to production */
        const table_definitions: string[] = [
            `CREATE TABLE IF NOT EXISTS Ticker (
                ticker_symbol VARCHAR(20) PRIMARY KEY,
                company_name VARCHAR(255)
            )`,
            `CREATE TABLE IF NOT EXISTS Ticker_End_Of_Day (
                eod_id INT AUTO_INCREMENT PRIMARY KEY,
                ticker_symbol VARCHAR(20),
                open_price DECIMAL(8, 2),
                high_price DECIMAL(8, 2),
                low_price DECIMAL(8, 2),
                close_price DECIMAL(8, 2),
                volume BIGINT,
                adjusted_open DECIMAL(8, 2),
                adjusted_high DECIMAL(8, 2),
                adjusted_low DECIMAL(8, 2),
                adjusted_close DECIMAL(8, 2),
                adjusted_volume BIGINT,
                split_factor DECIMAL(8, 2),
                dividend DECIMAL(8, 2),
                exchange VARCHAR(20),
                date DATE,
                FOREIGN KEY (ticker_symbol) REFERENCES Ticker(ticker_symbol)
            )`,
            `CREATE TABLE IF NOT EXISTS Ticker_Intraday (
                intraday_id INT AUTO_INCREMENT PRIMARY KEY,
                ticker_symbol VARCHAR(20),
                open_price DECIMAL(8, 2),
                high_price DECIMAL(8, 2),
                low_price DECIMAL(8, 2),
                last_price DECIMAL(8, 2),
                close_price DECIMAL(8, 2),
                volume BIGINT,
                exchange VARCHAR(20),
                date_time DATETIME,
                FOREIGN KEY (ticker_symbol) REFERENCES Ticker(ticker_symbol)
            )`,
            `CREATE TABLE IF NOT EXISTS User (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(20) UNIQUE,
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255),
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                starting_amount DECIMAL(15, 2) DEFAULT 10000.00,
                current_balance DECIMAL(15, 2) DEFAULT 10000.00,
                is_email_verified BOOLEAN DEFAULT false,
                verification_token VARCHAR(255)
            )`,
            `CREATE TABLE IF NOT EXISTS Transaction (
                transaction_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                ticker_symbol VARCHAR(20),
                transaction_type VARCHAR(4),
                quantity INT,
                price_per_share DECIMAL(8, 2),
                transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES User(user_id),
                FOREIGN KEY (ticker_symbol) REFERENCES Ticker(ticker_symbol)
            )`,
            `CREATE TABLE IF NOT EXISTS Watch_List (
                watch_list_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                ticker_symbol VARCHAR(20),
                FOREIGN KEY (user_id) REFERENCES User(user_id),
                FOREIGN KEY (ticker_symbol) REFERENCES Ticker(ticker_symbol)
            )`,
            `CREATE TABLE IF NOT EXISTS Trade_Order (
                order_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                ticker_symbol VARCHAR(20),
                order_type VARCHAR(10),
                trigger_price DECIMAL(8, 2),
                quantity INT,
                fulfilled BOOLEAN DEFAULT FALSE,
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES User(user_id),
                FOREIGN KEY (ticker_symbol) REFERENCES Ticker(ticker_symbol)
            )`,
            `CREATE TABLE IF NOT EXISTS User_Reset (
                reset_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                starting_amount DECIMAL(15, 2),
                end_amount DECIMAL(15, 2),
                reset_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES User(user_id)
            )`,
            `CREATE TABLE IF NOT EXISTS Refresh_Token (
                token_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                token VARCHAR(255),
                expiry_date TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES User(user_id)
            )`
        ];

        console.log("Creating tables");
        for (const table_definition of table_definitions) {
            await executeQuery(table_definition);
            console.log(`Table ${table_definition.split(' ')[5]} created`);
        }

        console.log("Database initialized!");

    } catch (error: any) {
        console.error(`Error initializing database: ${error.message}`);
    }
}

export default initializeDatabase;
