import fs from 'fs/promises';
import path from 'path';
import { DockerRunner, DockerContainer, DockerRunOptions } from './DockerRunner';
import { LanguageConfig } from '../languages/types';
import { SubmissionRequest, ExecutionResult, TestCaseResult } from '../../models/Submission';

export class ExecutionEngine {
  private dockerRunner: DockerRunner;

  constructor(dockerRunner: DockerRunner) {
    this.dockerRunner = dockerRunner;
  }

  public async compile(container: DockerContainer, submission: SubmissionRequest, languageConfig: LanguageConfig): Promise<ExecutionResult> {
    const workingDir = '/workspace';
    const submissionFolder = await this.prepareSubmissionFolder(submission, languageConfig);
    const compileCommand = languageConfig.compileCommand;

    const result = await this.dockerRunner.runContainer({
      image: languageConfig.dockerImage,
      containerName: container.name,
      command: compileCommand,
      mountPath: submissionFolder,
      workDir: workingDir,
      memoryMb: languageConfig.memoryLimitMb,
      cpus: 0.5,
      timeoutMs: languageConfig.compileTimeoutMs,
    });

    if (result.exitCode !== 0 || result.stderr) {
      return {
        status: 'Compilation Error',
        success: false,
        compileOutput: result.stderr || result.stdout,
        runtimeOutput: '',
        results: [],
        executionTimeMs: 0,
        memoryUsageMb: 0,
      };
    }

    return {
      status: 'Compilation Successful',
      success: true,
      compileOutput: result.stdout,
      runtimeOutput: '',
      results: [],
      executionTimeMs: 0,
      memoryUsageMb: 0,
    };
  }

  public async execute(container: DockerContainer, submission: SubmissionRequest, languageConfig: LanguageConfig): Promise<ExecutionResult> {
    const submissionFolder = await this.prepareSubmissionFolder(submission, languageConfig);
    const workingDir = '/workspace';
    const testResults: TestCaseResult[] = [];
    let passed = 0;
    let failed = 0;
    let totalExecutionTimeMs = 0;

    for (const testCase of submission.testCases) {
      const inputFilePath = path.join(submissionFolder, 'input.txt');
      await fs.writeFile(inputFilePath, testCase.input, 'utf8');

      const runCommand = `${languageConfig.runCommand} < input.txt`;
      const startTime = Date.now();
      const result = await this.dockerRunner.runContainer({
        image: languageConfig.dockerImage,
        containerName: container.name,
        command: runCommand,
        mountPath: submissionFolder,
        workDir: workingDir,
        memoryMb: languageConfig.memoryLimitMb,
        cpus: 0.5,
        timeoutMs: languageConfig.runTimeoutMs,
      });
      const durationMs = Date.now() - startTime;

      const stdout = result.stdout.trim();
      const stderr = result.stderr.trim();
      const passedTest = stdout === testCase.expectedOutput.trim();

      if (passedTest) {
        passed += 1;
      } else {
        failed += 1;
      }

      testResults.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        output: stdout,
        error: stderr,
        passed: passedTest,
        executionTimeMs: durationMs,
        memoryUsageMb: languageConfig.memoryLimitMb,
      });

      totalExecutionTimeMs += durationMs;
    }

    return {
      status: failed === 0 ? 'Accepted' : 'Wrong Answer',
      success: failed === 0,
      compileOutput: '',
      runtimeOutput: testResults.map((r) => r.output).join('\n'),
      results: testResults,
      executionTimeMs: totalExecutionTimeMs,
      memoryUsageMb: languageConfig.memoryLimitMb,
      passedCount: passed,
      failedCount: failed,
    };
  }

  private async prepareSubmissionFolder(submission: SubmissionRequest, languageConfig: LanguageConfig): Promise<string> {
    const baseDir = path.resolve(__dirname, '../../temp', submission.id);
    await fs.mkdir(baseDir, { recursive: true });
    await fs.writeFile(path.join(baseDir, languageConfig.sourceFileName), submission.code, 'utf8');
    return baseDir.replace(/\\/g, '/');
  }
}
