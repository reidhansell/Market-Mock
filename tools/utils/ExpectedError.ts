
class ExpectedError extends Error {
    statusCode: number;
    devMessage: string;

    constructor(message: string, statusCode: number, devMessage: string) {
        super(message);
        this.statusCode = statusCode;
        this.devMessage = devMessage;
    }
}

export default ExpectedError;