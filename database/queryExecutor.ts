const { getDatabaseConnection } = require('./databaseConnector');

/*  Convert callback-based queries into Promises    */

async function executeQuery(query, parameters = []) {
    const databaseConnection = await getDatabaseConnection();
    return new Promise((resolve, reject) => {
        databaseConnection.query(query, parameters, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports = {
    executeQuery,
};
