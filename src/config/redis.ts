import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on('error', function (err) {
  console.error('Redis Client Error:', err);
});

const connectRedis = async () => {
  try {
    await client.connect();
    console.log('🚀 Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
};

export { client, connectRedis };
