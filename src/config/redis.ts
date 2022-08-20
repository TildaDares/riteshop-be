import { createClient } from 'redis';

export type RedisClientType = ReturnType<typeof createClient>

let redisClient: RedisClientType;
async function redisConfig () {
  redisClient = createClient();

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
