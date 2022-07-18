import { cleanEnv, str, port } from "envalid";

function validateEnv(): void {
    cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ['development', 'production']
        }),
        MONGODB_URI: str(),
        PORT: port({ default: 8000 })
    });
}

export default validateEnv;
