import request from 'supertest';
import app from '../server';
import { Server } from 'http';

jest.mock('../tools/utils/Logger', () => ({
    initialize: jest.fn(() => null),
}));

jest.mock('../tools/utils/Router', () => ({
    initialize: jest.fn(() => null),
}));

jest.mock('../tools/jobs/CronJobs', () => ({
    scheduleJobs: jest.fn(() => null)
}));

jest.mock('../database/databaseConnector', () => ({
    initializeDatabaseConnection: jest.fn(() => null)
}));

jest.mock('../database/databaseInitializer', () => {
    return jest.fn(() => Promise.resolve(null));
});

describe('Server Initialization', () => {
    let server: Server;

    beforeAll(() => {
        server = app.listen(3000);
    });

    afterAll((done) => {
        server.close(done);
    });
    it('should start and listen on the correct port', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(404);
    });
});