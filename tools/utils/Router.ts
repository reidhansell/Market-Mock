import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import ExpectedError from './ExpectedError';
import config from '../../config.json';

export default class Router {
    private static app: express.Express;

    static initialize(app: express.Express) {
        this.app = app;

        this.setupMiddleware();
        this.loadStaticContent();
        this.loadRoutes(path.join(__dirname, '../../routes'), '/api');
        this.setupErrorHandler();
    }

    private static setupMiddleware() {
        this.app.use(cors({
            origin: config.clientURL,
            credentials: true,
        }));
        this.app.use(express.json());
        this.app.use(cookieParser());
    }

    private static loadStaticContent() {
        if (config.production) {
            this.app.use(express.static(path.join(__dirname, '../client/build')));

            this.app.get('*', (req: Request, res: Response) => {
                res.sendFile(path.join(__dirname, '../client/build/index.html'));
            });
        }
    }

    private static loadRoutes(dir: string, basePath = '/') {
        const files = fs.readdirSync(dir);

        files.forEach((file) => {
            if (file.endsWith('.test.ts') || file.endsWith('.test.js')) return;
            const filePath = path.join(dir, file);
            const stat = fs.lstatSync(filePath);

            if (stat.isDirectory()) {
                const subDirectory = path.join(basePath, file);
                this.loadRoutes(filePath, subDirectory);
            } else {
                this.bindRouteFromFile(filePath, basePath, file);
            }
        });
    }

    private static bindRouteFromFile(filePath: string, basePath: string, fileName: string) {
        const routePath = path.parse(fileName).name;
        const routeHandler = require(filePath);
        const fullRoutePath = path.join(basePath, routePath).replace(/\\/g, '/');

        this.app.use(fullRoutePath, routeHandler.default);
    }

    private static setupErrorHandler() {
        this.app.use(this.errorHandler);
    }

    private static errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
        if (error instanceof ExpectedError) {
            if (error.statusCode === 500) {
                console.error(error.devMessage);
            }
            res.status(error.statusCode).json({ error: error.message });
            return;
        }
        console.error(`An unexpected error occurred:\n${JSON.stringify({ error: error.message, url: req.originalUrl, body: req.body })}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
