import { cleanEnv, str, port } from 'envalid';

function validateEnv(): void {
  cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ['development', 'production'],
    }),
    MONGODB_URI: str(),
    PORT: port({ default: 8000 }),
    MONGODB_URI_TEST: str(),
    JWT_SECRET: str(),
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
  });
}

export default validateEnv;
