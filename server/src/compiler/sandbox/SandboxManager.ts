import { DockerRunner } from './DockerRunner';
import { CompilerFactory } from './CompilerFactory';
import { ExecutionEngine } from './ExecutionEngine';
import { ContainerPool } from './ContainerPool';
import { LanguageConfig } from '../languages/types';
import { SubmissionRequest, ExecutionResult } from '../../models/Submission';

export class SandboxManager {
  private dockerRunner: DockerRunner;
  private compilerFactory: CompilerFactory;
  private executionEngine: ExecutionEngine;
  private containerPool: ContainerPool;

  constructor() {
    this.dockerRunner = new DockerRunner();
    this.compilerFactory = new CompilerFactory();
    this.executionEngine = new ExecutionEngine(this.dockerRunner);
    this.containerPool = new ContainerPool(this.dockerRunner);
  }

  public async runSubmission(submission: SubmissionRequest): Promise<ExecutionResult> {
    const languageConfig = this.compilerFactory.getLanguageConfig(submission.language);
    if (!languageConfig) {
      return {
        status: 'Internal Server Error',
        error: `Unsupported language: ${submission.language}`,
      } as ExecutionResult;
    }

    const container = await this.containerPool.allocateContainer(languageConfig);
    try {
      const compileResult = await this.executionEngine.compile(container, submission, languageConfig);
      if (!compileResult.success) {
        return compileResult;
      }

      const runResult = await this.executionEngine.execute(container, submission, languageConfig);
      return runResult;
    } finally {
      await this.containerPool.destroyContainer(container);
    }
  }
}
