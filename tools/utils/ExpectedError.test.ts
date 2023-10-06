import ExpectedError from './ExpectedError';

describe('ExpectedError', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should correctly initialize with given parameters', () => {
        const errorMessage = 'This is a test error';
        const statusCode = 400;
        const devMessage = 'Detailed error message for developers';

        const errorInstance = new ExpectedError(errorMessage, statusCode, devMessage);

        expect(errorInstance.message).toBe(errorMessage);
        expect(errorInstance.statusCode).toBe(statusCode);
        expect(errorInstance.devMessage).toBe(devMessage);
    });

    it('should be an instance of Error', () => {
        const errorInstance = new ExpectedError('Test', 400, 'Dev Test');
        expect(errorInstance).toBeInstanceOf(Error);
    });

    it('should be an instance of ExpectedError', () => {
        const errorInstance = new ExpectedError('Test', 400, 'Dev Test');
        expect(errorInstance).toBeInstanceOf(ExpectedError);
    });
});
