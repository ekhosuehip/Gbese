import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on('error', function (err) {
  throw err;
});

(async () => {
  try {
    await client.connect();
    console.log('🚀 Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
})();

export default client;