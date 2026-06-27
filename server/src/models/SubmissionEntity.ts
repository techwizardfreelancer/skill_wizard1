import mongoose, { Document, Schema } from 'mongoose';
import { TestCaseResult } from './Submission';

export interface SubmissionEntity extends Document {
  submissionId: string;
  questionId: string;
  language: string;
  code: string;
  status: string;
  score: number;
  testResults: TestCaseResult[];
  passedCount: number;
  failedCount: number;
  executionTimeMs: number;
  memoryUsageMb: number;
  compileOutput: string;
  runtimeOutput: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseResultSchema = new Schema<TestCaseResult>({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  output: { type: String, required: true },
  error: { type: String, required: false },
  passed: { type: Boolean, required: true },
  executionTimeMs: { type: Number, required: true },
  memoryUsageMb: { type: Number, required: true },
});

const SubmissionSchema = new Schema<SubmissionEntity>(
  {
    submissionId: { type: String, required: true, unique: true },
    questionId: { type: String, required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    status: { type: String, required: true, default: 'pending' },
    score: { type: Number, required: true, default: 0 },
    testResults: { type: [TestCaseResultSchema], default: [] },
    passedCount: { type: Number, required: true, default: 0 },
    failedCount: { type: Number, required: true, default: 0 },
    executionTimeMs: { type: Number, required: true, default: 0 },
    memoryUsageMb: { type: Number, required: true, default: 0 },
    compileOutput: { type: String, required: true, default: '' },
    runtimeOutput: { type: String, required: true, default: '' },
    error: { type: String, required: false },
  },
  { timestamps: true },
);

export const SubmissionModel = mongoose.model<SubmissionEntity>('Submission', SubmissionSchema);
