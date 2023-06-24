
class ExpectedError extends Error {
    constructor(message, statusCode, devMessage) {
        super(message);
        this.statusCode = statusCode;
        this.devMessage = devMessage;
    }
}

module.exports = ExpectedError;