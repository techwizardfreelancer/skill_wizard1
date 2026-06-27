import { Worker, Job } from 'bullmq';
import { SubmissionService } from '../services/SubmissionService';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const submissionService = new SubmissionService();

export class SubmissionWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      'submissions',
      async (job: Job) => {
        const submission = job.data as any;
        try {
          await submissionService.processSubmit(submission);
        } catch (error) {
          console.error('Submission worker failed to process job', {
            jobId: job?.id,
            submission,
            error,
          });
        }
      },
      { connection: { url: redisUrl } },
    );

    this.worker.on('failed', (job, err) => {
      console.error('Submission job failed', { jobId: job?.id, error: err?.message || err });
    });
  }

  public close(): Promise<void> {
    return this.worker.close();
  }
}
