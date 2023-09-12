import { createLogger, format, transports } from 'winston';

export default class Logger {
    static initialize() {
        console.log('Initializing logger...');
        const logger = createLogger({
            transports: [
                new transports.File({ filename: 'logs/error.log', level: 'error' }),
                new transports.File({ filename: 'logs/combined.log' }),
            ],
            format: format.combine(
                format.timestamp(),
                format.json(),
            ),
        });

        console.log = this.generateConsoleMethod(console.log, logger.info);
        console.error = this.generateConsoleMethod(console.error, logger.error);

        console.log('Successfully initialized logger');
    }

    static generateConsoleMethod(originalMethod: Function, loggerMethod: Function) {
        return function (msg: any) {
            originalMethod(msg);
            loggerMethod(msg);
        };
    }
}
