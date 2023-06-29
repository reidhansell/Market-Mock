import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import ExpectedError from './ExpectedError';
import config from '../config.json';

export default class Router {
    private static app: express.Express;

    static initialize(app: express.Express) {
        this.app = app;
        console.log('Initializing routes...');
        this.app.use(cors({
            origin: config.clientURL,
            credentials: true,
        }));
        this.app.use(express.json());
        this.app.use(cookieParser());

        if (config.production) {
            this.app.use(express.static(path.join(__dirname, '../client/build')));

            this.app.get('*', (req: Request, res: Response) => {
                res.sendFile(path.join(__dirname, '../client/build/index.html'));
            });
        }

        this.loadRoutes(path.join(__dirname, '../routes'), '/api');
        this.errorHandler();

        console.log('Successfully initialized routes');
    }

    static loadRoutes(dir: string, basePath = '/') {
        const files = fs.readdirSync(dir);

        files.forEach((file) => {
            const filePath = path.join(dir, file);
            const stat = fs.lstatSync(filePath);

            if (stat.isDirectory()) {
                const subDirectory = path.join(basePath, file);
                this.loadRoutes(filePath, subDirectory);
            } else {
                const routePath = path.parse(file).name;
                const routeHandler = require(filePath);
                let fullRoutePath = path.join(basePath, routePath);

                fullRoutePath = fullRoutePath.replace(/\\/g, '/');

                this.app.use(fullRoutePath, routeHandler.default);
            }
        });
    }

    static errorHandler() {
        this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
            if (error instanceof ExpectedError) {
                if (error.statusCode === 500) {
                    console.error(error.devMessage);
                }
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.error(`An unexpected error occurred:\n${JSON.stringify({ error: error.message, url: req.originalUrl, body: req.body })}`);
            res.status(500).json({ error: 'Internal Server Error' });
        });
    }
}
