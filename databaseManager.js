const mysql = require('mysql');
const config = require('./config.json');

const connection = mysql.createConnection({
    host: config.dbhostname,
    user: config.dbusername,
    password: config.dbpassword,
    database: config.dbname,
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to database: ", err);
        process.exit(1); // Exit process with failure
    }
    console.log("Connected!");

    const tables = [
        'Refresh_Tokens',
        'User_Reset',
        'Orders',
        'Watch_List',
        'Transactions',
        'Users'
    ];

    const table_definitions = [
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
                stock_symbol VARCHAR(10),
                transaction_type VARCHAR(4),
                quantity INT,
                price_per_share DECIMAL(8, 2),
                transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(user_id)
            )`,
        `CREATE TABLE IF NOT EXISTS Watch_List (
                watch_list_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                stock_symbol VARCHAR(10),
                FOREIGN KEY (user_id) REFERENCES Users(user_id)
            )`,
        `CREATE TABLE IF NOT EXISTS Orders (
                order_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                stock_symbol VARCHAR(10),
                order_type VARCHAR(10),
                trigger_price DECIMAL(8, 2),
                quantity INT,
                fulfilled BOOLEAN DEFAULT FALSE,
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(user_id)
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

    /* DANGER ZONE DO NOT TOUCH
    if (!config.production) {
        for (const table of tables) {
            connection.query(`DROP TABLE IF EXISTS ${table}`, function (err, result) {
                if (err) {
                    console.error(`Error dropping ${table} table: `, err);
                    process.exit(1);
                }
                console.log(`${table} table dropped`);
            });
        }
    }*/

    for (const table_definition of table_definitions) {
        connection.query(table_definition, function (err, result) {
            if (err) {
                console.error("Error creating table: ", err);
                process.exit(1);
            }
            console.log(`${table_definition.split(' ')[5]} table created`);
        });
    }
});

module.exports = connection;
