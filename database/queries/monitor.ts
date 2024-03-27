import { executeQuery, ResultObject } from '../queryExecutor';
import ExpectedError from '../../tools/utils/ExpectedError';
import HTTPRequest from '../../models/HTTPRequest';
import HardwareLoadLog from '../../models/HardwareLoadLog';
import { Connection } from 'mysql';

async function insertHTTPRequest(request_url: String, response_status: Number, request_ip: String, connection?: Connection): Promise<void> {
    const query = `
        INSERT INTO HTTP_Request (request_url, response_status, request_ip) VALUES (?, ?, ?)
    `;
    const parameters = [request_url, response_status, request_ip];
    let results: ResultObject;
    if (connection) {
        results = await executeQuery(query, parameters, connection) as ResultObject;
    } else {
        results = await executeQuery(query, parameters) as ResultObject;
    }
    if (results.affectedRows === 0) {
        throw new ExpectedError('Failed to insert HTTP Request', 500, `Failed query: "${query}" with parameters: "${parameters}"`);
    }

}

async function getSevenDayHTTPRequests(): Promise<HTTPRequest[]> {
    const query = `
        SELECT * FROM HTTP_Request
        WHERE request_date >= (UNIX_TIMESTAMP() - 604800)
        ORDER BY request_date ASC
    `;

    const results = await executeQuery(query, []) as HTTPRequest[];
    return results;
}

async function deleteOldHTTPRequests(): Promise<void> {
    const query = `
        DELETE FROM HTTP_Request
        WHERE request_date < (UNIX_TIMESTAMP() - 604800)
    `;

    await executeQuery(query, []);
}

async function insertHardwareLoadLog(cpu_load: Number, memory_load: Number, disk_usage: Number, connection?: Connection): Promise<void> {
    const insertQuery = `
        INSERT INTO Hardware_Load_Log (cpu_load, memory_load, disk_usage) VALUES (?, ?, ?)
    `;

    const insertParameters = [cpu_load, memory_load, disk_usage];

    let results: ResultObject;

    if (connection) {
        results = await executeQuery(insertQuery, insertParameters, connection) as ResultObject;
    } else {
        results = await executeQuery(insertQuery, insertParameters) as ResultObject;
    }

    if (results.affectedRows === 0) {
        throw new ExpectedError('Failed to insert Hardware Load Log', 500, `Failed query: "${insertQuery}" with parameters: "${insertParameters}"`);
    }
}

async function getSevenDayHardwareLoadLogs(): Promise<HardwareLoadLog[]> {
    const query = `
        SELECT * FROM Hardware_Load_Log
        WHERE log_date >= (UNIX_TIMESTAMP() - 604800)
        ORDER BY log_date ASC
    `;

    const results = await executeQuery(query, []) as HardwareLoadLog[];
    return results;
}

async function deleteOldHardwareLoadLogs(): Promise<void> {
    const query = `
        DELETE FROM Hardware_Load_Log
        WHERE log_date < (UNIX_TIMESTAMP() - 604800)
    `;

    await executeQuery(query, []);
}

export {
    insertHTTPRequest,
    getSevenDayHTTPRequests,
    deleteOldHTTPRequests,
    insertHardwareLoadLog,
    getSevenDayHardwareLoadLogs,
    deleteOldHardwareLoadLogs
};