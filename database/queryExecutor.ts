import { getDatabaseConnection } from './databaseConnector';
import { MysqlError, Connection } from 'mysql';

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

async function executeQuery(
    query: string,
    parameters: any[] = [],
    connection?: Connection
): Promise<Array<any> | ResultObject> {
    const databaseConnection = connection || await getDatabaseConnection();
    return new Promise((resolve, reject) => {
        databaseConnection.query(query, parameters, (error: MysqlError | null, results: Array<any> | ResultObject) => {
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
