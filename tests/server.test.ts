import request from 'supertest';
import app from '../server';
import { Server } from 'http';
import { closeDatabaseConnection, closeTransactionPool } from '../database/databaseConnector';
import CronJobs from '../tools/jobs/CronJobs';

jest.mock('../tools/utils/Logger', () => ({
    initialize: jest.fn(),
}));

jest.mock('../tools/utils/Router', () => ({
    initialize: jest.fn(),
}));

jest.mock('../tools/jobs/CronJobs', () => ({
    scheduleJobs: jest.fn(),
    stopAll: jest.fn(),
}));

jest.mock('../database/databaseConnector', () => ({
    initializeDatabaseConnection: jest.fn(),
}));

jest.mock('../database/databaseInitializer', () => {
    return jest.fn(() => Promise.resolve());
});

describe('Server Initialization', () => {
    let server: Server;

    beforeAll(() => {
        server = app.listen(3000);  // or whatever your intended port is
    });

    afterAll((done) => {
        server.close(done);  // close the server after tests
    });
    it('should start and listen on the correct port', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(404);
    });
});

