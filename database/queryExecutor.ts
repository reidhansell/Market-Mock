import { getDatabaseConnection } from './DatabaseConnector';
import * as mysql from 'mysql';

/*  Convert callback-based queries into Promises    */

/*  Response interfaces for different types of responses from MySQL queries.
    Note: Select queries return results directly, while other queries return a result object.   */

interface ResultObject {
    insertId: number;
    affectedRows: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
}

async function executeQuery(query: string, parameters: any[] = []): Promise<Array<Object> | ResultObject> {
    const databaseConnection = await getDatabaseConnection();
    return new Promise((resolve, reject) => {
        databaseConnection.query(query, parameters, (error: mysql.MysqlError | null, results: Array<Object> | ResultObject) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

export {
    executeQuery,
    ResultObject
};
