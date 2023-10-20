import express, { Express, Request, Response, NextFunction, Router } from 'express';
import ExpectedError from './ExpectedError';

/* This file serves no purpose in production. */
/* This file should not be tested. */

export const setupApp = (router: Router): Express => {
    const app = express();
    app.use(express.json());
    app.use('/api', router);
    app.use(errorHandler);
    return app;
};

const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof ExpectedError) {
        if (error.statusCode === 500) {
            console.error(error.devMessage);
        }
        res.status(error.statusCode).json({ error: error.message });
        return;
    }
    console.error(`An unexpected error occurred:\n${JSON.stringify({ error: error.message, url: req.originalUrl, body: req.body })}`);
    res.status(500).json({ error: 'Internal Server Error' });
};