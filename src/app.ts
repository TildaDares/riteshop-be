import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression'
import Controller from '@/utils/interfaces/controller.interface';
import ErrorMiddleware from '@/middleware/error.middleware';

class App {
  public app: Express;
  public port: number;

  constructor(controllers: Controller[], port: number) {
    this.app = express();
    this.port = port;

    this.initializeDBConnection();
    this.initializeMiddleware();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  private initializeDBConnection(): void {
    const MONGODB_URI  = process.env.MONGODB_URI || '';
    mongoose.connect(MONGODB_URI);
  }

  private initializeMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(compression());
  }

  private initializeControllers(controllers: Controller[]): void {
    controllers.forEach((controller) => {
      this.app.use('/api', controller.router);
    })
  }

  private initializeErrorHandling(): void {
    this.app.use(ErrorMiddleware);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${this.port}`);
    });
  }
}

export default App
