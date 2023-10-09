import { executeQuery } from './queryExecutor';
import quests from './quests.json';
import Quest from '../models/Quest';

async function initializeDatabase(): Promise<void> {
    try {
        console.log("Beginning database initialization.");
        const table_definitions: string[] = [
            `CREATE TABLE IF NOT EXISTS Ticker (
                ticker_symbol VARCHAR(20) PRIMARY KEY,
                company_name VARCHAR(255)
            )`,
            `CREATE TABLE IF NOT EXISTS Ticker_End_Of_Day (
                eod_id INT AUTO_INCREMENT PRIMARY KEY,
                ticker_symbol VARCHAR(20),
                open DECIMAL(8, 2),
                high DECIMAL(8, 2),
                low DECIMAL(8, 2),
                close DECIMAL(8, 2),
                volume BIGINT,
                adjusted_open DECIMAL(8, 2),
                adjusted_high DECIMAL(8, 2),
                adjusted_low DECIMAL(8, 2),
                adjusted_close DECIMAL(8, 2),
                adjusted_volume BIGINT,
                split_factor DECIMAL(8, 2),
                dividend DECIMAL(8, 2),
                exchange VARCHAR(20),
                date BIGINT,
                FOREIGN KEY (ticker_symbol) REFERENCES Ticker(ticker_symbol)
            )`,
            `CREATE TABLE IF NOT EXISTS Ticker_Intraday (
                intraday_id INT AUTO_INCREMENT PRIMARY KEY,
                ticker_symbol VARCHAR(20),
                open DECIMAL(8, 2),
                high DECIMAL(8, 2),
                low DECIMAL(8, 2),
                last DECIMAL(8, 2),
                close DECIMAL(8, 2),
                volume BIGINT,
                exchange VARCHAR(20),
                date BIGINT,
                FOREIGN KEY (ticker_symbol) REFERENCES Ticker(ticker_symbol)
            )`,
            `CREATE TABLE IF NOT EXISTS User (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(20) UNIQUE,
                email VARCHAR(255) UNIQUE,
                password VARCHAR(255),
                registration_date BIGINT DEFAULT (UNIX_TIMESTAMP()),
                starting_amount DECIMAL(15, 2) DEFAULT 10000.00,
                current_balance DECIMAL(15, 2) DEFAULT 10000.00,
                is_email_verified BOOLEAN DEFAULT false,
                verification_token VARCHAR(255)
            )`,
            `CREATE TABLE IF NOT EXISTS User_Stocks (
                user_id INT,
                ticker_symbol VARCHAR(20),
                quantity INT,
                FOREIGN KEY (user_id) REFERENCES User(user_id),
                FOREIGN KEY (ticker_symbol) REFERENCES Ticker(ticker_symbol),
                PRIMARY KEY (user_id, ticker_symbol)
            )`,
            `CREATE TABLE IF NOT EXISTS Watch_List (
                user_id INT,
                ticker_symbol VARCHAR(20),
                FOREIGN KEY (user_id) REFERENCES User(user_id),
                FOREIGN KEY (ticker_symbol) REFERENCES Ticker(ticker_symbol),
                PRIMARY KEY (user_id, ticker_symbol)
            )`,
            `CREATE TABLE IF NOT EXISTS Trade_Order (
                order_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                ticker_symbol VARCHAR(20),
                order_type ENUM('MARKET', 'LIMIT', 'STOP') NOT NULL,
                trigger_price DECIMAL(8, 2),
                quantity INT,
                cancelled BOOLEAN DEFAULT FALSE,
                order_date BIGINT DEFAULT (UNIX_TIMESTAMP()),
                FOREIGN KEY (user_id) REFERENCES User(user_id),
                FOREIGN KEY (ticker_symbol) REFERENCES Ticker(ticker_symbol)
            )`,
            `CREATE TABLE IF NOT EXISTS Transaction (
                transaction_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT,
                price_per_share DECIMAL(8, 2),
                transaction_date BIGINT DEFAULT (UNIX_TIMESTAMP()),
                FOREIGN KEY (order_id) REFERENCES Trade_Order(order_id)
            )`,
            `CREATE TABLE IF NOT EXISTS User_Reset (
                reset_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                starting_amount DECIMAL(15, 2),
                end_amount DECIMAL(15, 2),
                reset_date BIGINT DEFAULT (UNIX_TIMESTAMP()),
                FOREIGN KEY (user_id) REFERENCES User(user_id)
            )`,
            `CREATE TABLE IF NOT EXISTS Refresh_Token (
                token_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                token VARCHAR(255),
                expiry_date BIGINT,
                FOREIGN KEY (user_id) REFERENCES User(user_id)
            )`,
            `CREATE TABLE IF NOT EXISTS User_Net_Worth (
                user_id INT,
                recorded_at BIGINT DEFAULT (UNIX_TIMESTAMP()),
                net_worth DECIMAL(15, 2),
                PRIMARY KEY (user_id, recorded_at),
                FOREIGN KEY (user_id) REFERENCES User(user_id)
            )`,
            `CREATE TABLE IF NOT EXISTS Notification (
                notification_id INT AUTO_INCREMENT PRIMARY KEY,
                content VARCHAR(255),
                user_id INT,
                success BOOLEAN,
                viewed BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES User(user_id)
            )`,
            `CREATE TABLE IF NOT EXISTS Quest (
                quest_id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS User_Quest (
                user_id INT NOT NULL,
                quest_id INT NOT NULL,
                completion_date BIGINT DEFAULT (UNIX_TIMESTAMP()),
                PRIMARY KEY (user_id, quest_id),
                FOREIGN KEY (quest_id) REFERENCES Quest(quest_id),
                FOREIGN KEY (user_id) REFERENCES User(user_id)
            )`
        ];

        console.log("Creating tables");
        for (const table_definition of table_definitions) {
            await executeQuery(table_definition);
            console.log(`Table ${table_definition.split(' ')[5]} created`);
        }

        const existingQuests = await executeQuery('SELECT * FROM Quest') as Quest[];
        if (existingQuests.length > 0) {
            console.log("Quests already exist, skipping quest data insertion");
        } else {
            console.log("Inserting quest data");
            for (const quest of quests) {
                const query = `INSERT INTO Quest (name, description) VALUES (?, ?)`;
                await executeQuery(query, [quest.name, quest.description]);
                console.log(`Inserted quest: ${quest.name}`);
            }
        }
        console.log("Database initialized!");

    } catch (error: any) {
        console.error(`Error initializing database: ${error.message}`);
    }
}

export default initializeDatabase;
