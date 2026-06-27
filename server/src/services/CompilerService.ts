import { SandboxManager } from '../compiler/sandbox/SandboxManager';
import { SubmissionRequest, ExecutionResult } from '../models/Submission';

export class CompilerService {
  private sandboxManager: SandboxManager;

  constructor() {
    this.sandboxManager = new SandboxManager();
  }

  public async run(submission: SubmissionRequest): Promise<ExecutionResult> {
    return this.sandboxManager.runSubmission(submission);
  }
}
