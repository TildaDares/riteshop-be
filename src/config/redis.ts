import { createClient } from 'redis';

export type RedisClientType = ReturnType<typeof createClient>

let redisClient: RedisClientType;
async function redisConfig() {
  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: 6379
    }
  });

  redisClient.on("error", (error) => {
    console.log(error);
  });

  redisClient.on("connect", () => {
    console.log("Redis connected!");
  });

  if (process.env.NODE_ENV !== 'test') {
    await redisClient.connect();
  }
}

export { redisConfig, redisClient };
