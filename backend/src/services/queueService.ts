import { Queue } from 'bullmq';
import { IConnectionOptions } from 'ioredis';

export const initializeQueues = () => {
  const connection: IConnectionOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  };
  // Example queues
  // new Queue('ci', { connection });
  // new Queue('webhooks', { connection });
  console.log('Queues initialized');
};

export default { initializeQueues };
