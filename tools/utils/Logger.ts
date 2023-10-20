import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

export default class Logger {
    private static defaultLogger?: WinstonLogger;

    static get logger(): WinstonLogger {
        if (!this.defaultLogger) {
            this.defaultLogger = this.createDefaultLogger();
        }
        return this.defaultLogger;
    }

    static initialize() {
        console.log('Initializing logger...');
        console.log = this.generateConsoleMethod(console.log, this.logger.info.bind(this.logger));
        console.error = this.generateConsoleMethod(console.error, this.logger.error.bind(this.logger));
        console.log('Successfully initialized logger');
    }

    private static createDefaultLogger(): WinstonLogger {
        return createLogger({
            transports: [
                new transports.File({ filename: 'logs/error.log', level: 'error' }),
                new transports.File({ filename: 'logs/combined.log' }),
            ],
            format: format.combine(
                format.timestamp(),
                format.json(),
            ),
        });
    }

    private static generateConsoleMethod(originalMethod: (...data: any[]) => void, loggerMethod: (...data: any[]) => void): (...data: any[]) => void {
        return function (...data: any[]) {
            originalMethod(...data);
            loggerMethod(...data);
        };
    }
}