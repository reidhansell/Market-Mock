jest.mock('winston', () => ({
    createLogger: jest.fn().mockReturnValue({
        info: jest.fn(),
        error: jest.fn(),
    }),
    transports: {
        File: jest.fn(),
    },
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        json: jest.fn(),
    },
}));

import Logger from './Logger';
import { createLogger } from 'winston';

describe('Logger', () => {
    let originalConsoleLog: any;
    let originalConsoleError: any;

    beforeEach(() => {
        originalConsoleLog = console.log;
        originalConsoleError = console.error;
    });

    afterEach(() => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        jest.clearAllMocks();
    });

    describe('initialize', () => {
        it('initializes the logger and overrides console methods', () => {
            const mockLog = jest.fn();
            const mockError = jest.fn();

            console.log = mockLog;
            console.error = mockError;

            Logger.initialize();

            expect(mockLog).toHaveBeenCalledWith('Initializing logger...');
            expect(mockLog).toHaveBeenCalledWith('Successfully initialized logger');
            expect(createLogger).toHaveBeenCalledWith(expect.objectContaining({
                format: undefined,
                transports: expect.arrayContaining([{}, {}]),
            }));


            console.log('test log');
            console.error('test error');

            expect(mockLog).toHaveBeenCalledTimes(3);
            expect(mockError).toHaveBeenCalledTimes(1);
        });
    });

    describe('console methods override', () => {
        it('invokes both the original and logger methods when using the overridden console.log', () => {
            const loggerInfoMock = jest.fn();
            const originalConsoleLogMock = jest.fn();
            const generatedMethod = Logger['generateConsoleMethod'](originalConsoleLogMock, loggerInfoMock);

            const testMessage = 'Test message';
            generatedMethod(testMessage);

            expect(originalConsoleLogMock).toHaveBeenCalledWith(testMessage);
            expect(loggerInfoMock).toHaveBeenCalledWith(testMessage);
        });

        it('invokes both the original and logger methods when using the overridden console.error', () => {
            const loggerErrorMock = jest.fn();
            const originalConsoleErrorMock = jest.fn();
            const generatedMethod = Logger['generateConsoleMethod'](originalConsoleErrorMock, loggerErrorMock);

            const testMessage = 'Test error message';
            generatedMethod(testMessage);

            expect(originalConsoleErrorMock).toHaveBeenCalledWith(testMessage);
            expect(loggerErrorMock).toHaveBeenCalledWith(testMessage);
        });
    });
});
