import { SubmissionModel, SubmissionEntity } from '../models/SubmissionEntity';
import { ExecutionResult } from '../models/Submission';

export class SubmissionRepository {
  public async create(submissionId: string, questionId: string, language: string, code: string): Promise<SubmissionEntity> {
    const submission = new SubmissionModel({ submissionId, questionId, language, code, status: 'pending' });
    return submission.save();
  }

  public async updateResult(submissionId: string, result: ExecutionResult): Promise<SubmissionEntity | null> {
    return SubmissionModel.findOneAndUpdate(
      { submissionId },
      {
        status: result.success ? 'completed' : 'failed',
        score: this.computeScore(result),
        testResults: result.results,
        passedCount: result.passedCount ?? 0,
        failedCount: result.failedCount ?? 0,
        executionTimeMs: result.executionTimeMs,
        memoryUsageMb: result.memoryUsageMb,
        compileOutput: result.compileOutput,
        runtimeOutput: result.runtimeOutput,
        error: result.error,
      },
      { new: true },
    ).exec();
  }

  public async getById(submissionId: string): Promise<SubmissionEntity | null> {
    return SubmissionModel.findOne({ submissionId }).exec();
  }

  public async updateStatus(submissionId: string, status: string, error?: string): Promise<SubmissionEntity | null> {
    return SubmissionModel.findOneAndUpdate(
      { submissionId },
      { status, error: error ?? undefined },
      { new: true },
    ).exec();
  }

  public computeScore(result: ExecutionResult): number {
    if (!result.success) {
      return 0;
    }
    const total = result.passedCount ?? 0;
    const failed = result.failedCount ?? 0;
    return total + failed === 0 ? 0 : Math.round((total / (total + failed)) * 100);
  }
}
