import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import Controller from '@/utils/interfaces/controller.interface';
import ErrorMiddleware from '@/middleware/error.middleware';
import '@/config/passport';
import { redisConfig } from '@/config/redis';
import passport from 'passport';
import { connectDB } from '@/config/connectDB';

class App {
  public app: Application;

  constructor(controllers: Controller[]) {
    this.app = express();

    if (process.env.NODE_ENV !== 'test') {
      connectDB()
    }
    this.initializeMiddleware();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(morgan('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(compression());
    (async () => {
      await redisConfig();
    })();
  }

  private initializeControllers(controllers: Controller[]): void {
    controllers.forEach((controller) => {
      this.app.use('/api', controller.router);
    });
    this.app.use(passport.initialize());
  }

  private initializeErrorHandling(): void {
    this.app.use(ErrorMiddleware);
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  }
}

export default App;
