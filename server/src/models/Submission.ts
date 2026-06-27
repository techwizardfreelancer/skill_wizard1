export interface TestCase {
  input: string;
  expectedOutput: string;
  weight?: number;
}

export interface SubmissionRequest {
  id: string;
  language: string;
  questionId: string;
  code: string;
  testCases: TestCase[];
}

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  output: string;
  error: string;
  passed: boolean;
  executionTimeMs: number;
  memoryUsageMb: number;
}

export interface ExecutionResult {
  status: string;
  success: boolean;
  compileOutput: string;
  runtimeOutput: string;
  results: TestCaseResult[];
  executionTimeMs: number;
  memoryUsageMb: number;
  passedCount?: number;
  failedCount?: number;
  error?: string;
}
