import { SubmissionRequest, ExecutionResult } from '../models/Submission';
import { CompilerService } from './CompilerService';
import { SubmissionRepository } from './SubmissionRepository';
import { QuestionRepository } from './QuestionRepository';
import { QueueService } from './QueueService';
import { getSocketServer } from '../sockets/socketServer';

export class SubmissionService {
  private submissionRepository: SubmissionRepository;
  private questionRepository: QuestionRepository;
  private compilerService: CompilerService;
  private queueService: QueueService;

  constructor() {
    this.submissionRepository = new SubmissionRepository();
    this.questionRepository = new QuestionRepository();
    this.compilerService = new CompilerService();
    this.queueService = new QueueService();
  }

  public async processRun(submission: SubmissionRequest): Promise<ExecutionResult> {
    await this.submissionRepository.create(submission.id, submission.questionId, submission.language, submission.code);

    const visibleCases = await this.questionRepository.findVisibleTestCases(submission.questionId);
    submission.testCases = visibleCases.length > 0 ? visibleCases : submission.testCases;

    const result = await this.compilerService.run(submission);
    await this.submissionRepository.updateResult(submission.id, result);
    return result;
  }

  public async processSubmit(submission: SubmissionRequest): Promise<ExecutionResult> {
    await this.submissionRepository.updateStatus(submission.id, 'running');
    const io = getSocketServer();
    if (io) {
      io.emit('submission-started', {
        submissionId: submission.id,
        questionId: submission.questionId,
        language: submission.language,
      });
    }

    const hiddenCases = await this.questionRepository.findHiddenTestCases(submission.questionId);
    submission.testCases = hiddenCases.length > 0 ? hiddenCases : submission.testCases;

    try {
      const result = await this.compilerService.run(submission);
      await this.submissionRepository.updateResult(submission.id, result);

      if (io) {
        io.emit('submission-completed', {
          submissionId: submission.id,
          status: result.success ? 'completed' : 'failed',
          score: result.success ? this.submissionRepository.computeScore(result) : 0,
          error: result.error,
        });
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.submissionRepository.updateStatus(submission.id, 'failed', message);

      if (io) {
        io.emit('submission-completed', {
          submissionId: submission.id,
          status: 'failed',
          score: 0,
          error: message,
        });
      }

      return {
        status: 'failed',
        success: false,
        compileOutput: '',
        runtimeOutput: '',
        results: [],
        executionTimeMs: 0,
        memoryUsageMb: 0,
        failedCount: 0,
        passedCount: 0,
        error: message,
      };
    }
  }

  public async enqueueSubmission(submission: SubmissionRequest): Promise<{ status: string; message: string }> {
    await this.submissionRepository.create(submission.id, submission.questionId, submission.language, submission.code);
    await this.queueService.enqueue(submission as unknown as Record<string, unknown>);

    return {
      status: 'pending',
      message: 'Submission queued for execution',
    };
  }

  public async getSubmissionById(submissionId: string) {
    return this.submissionRepository.getById(submissionId);
  }
}
