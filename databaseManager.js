const mysql = require('mysql');
const config = require('./config.json');

const connection = mysql.createConnection({
    host: config.dbhostname,
    user: config.dbusername,
    password: config.dbpassword,
    database: config.dbname
});

function createTables() {
    connection.connect((err) => {
        if (err) {
            console.error("Error connecting to database: ", err);
            process.exit(1); // Exit process with failure
        }
        console.log("Connected!");

        const tables = [
            `CREATE TABLE IF NOT EXISTS Users (
                UserID INT AUTO_INCREMENT PRIMARY KEY,
                Username VARCHAR(50),
                Email VARCHAR(255),
                Password VARCHAR(255),
                RegistrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                StartingAmount DECIMAL(15, 2),
                CurrentBalance DECIMAL(15, 2)
            )`,
            `CREATE TABLE IF NOT EXISTS Transactions (
                TransactionID INT AUTO_INCREMENT PRIMARY KEY,
                UserID INT,
                StockSymbol VARCHAR(10),
                TransactionType VARCHAR(4),
                Quantity INT,
                PricePerShare DECIMAL(8, 2),
                TransactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (UserID) REFERENCES Users(UserID)
            )`,
            `CREATE TABLE IF NOT EXISTS WatchList (
                WatchListID INT AUTO_INCREMENT PRIMARY KEY,
                UserID INT,
                StockSymbol VARCHAR(10),
                FOREIGN KEY (UserID) REFERENCES Users(UserID)
            )`,
            `CREATE TABLE IF NOT EXISTS Orders (
                OrderID INT AUTO_INCREMENT PRIMARY KEY,
                UserID INT,
                StockSymbol VARCHAR(10),
                OrderType VARCHAR(10),
                TriggerPrice DECIMAL(8, 2),
                Quantity INT,
                Fulfilled BOOLEAN DEFAULT FALSE,
                OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (UserID) REFERENCES Users(UserID)
            )`,
            `CREATE TABLE IF NOT EXISTS UserReset (
                ResetID INT AUTO_INCREMENT PRIMARY KEY,
                UserID INT,
                StartingAmount DECIMAL(15, 2),
                EndAmount DECIMAL(15, 2),
                ResetDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (UserID) REFERENCES Users(UserID)
            )`
        ];

        let pending = tables.length;
        for (const table of tables) {
            connection.query(table, function (err, result) {
                if (err) {
                    console.error("Error creating table: ", err);
                    process.exit(1); // Exit process with failure
                }
                console.log(`${table.split(' ')[2]} table created`);

                pending--;
                if (pending === 0) {
                    // All tables created, close connection
                    connection.end();
                }
            });
        }
    });
}

/* Example query
connection.query('SELECT * FROM my_table', (err, rows) => {
  if(err) throw err;

  console.log('Data received from Db:\n');
  console.log(rows);
});
*/

module.exports = { createTables };
