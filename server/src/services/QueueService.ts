import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const submissionQueue = new Queue('submissions', {
  connection: {
    url: redisUrl,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export class QueueService {
  public async enqueue(submission: Record<string, unknown>): Promise<void> {
    await submissionQueue.add('submission', submission);
  }
}
