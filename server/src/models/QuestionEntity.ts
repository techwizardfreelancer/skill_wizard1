import mongoose, { Document, Schema } from 'mongoose';
import { TestCase } from './Submission';

export interface QuestionEntity extends Document {
  questionId: string;
  title: string;
  description: string;
  language: string;
  visibleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
  sampleTestCases: TestCase[];
  timeLimitSeconds: number;
  memoryLimitMb: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseSchema = new Schema<TestCase>({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  weight: { type: Number, default: 1 },
});

const QuestionSchema = new Schema<QuestionEntity>(
  {
    questionId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    visibleTestCases: { type: [TestCaseSchema], default: [] },
    hiddenTestCases: { type: [TestCaseSchema], default: [] },
    sampleTestCases: { type: [TestCaseSchema], default: [] },
    timeLimitSeconds: { type: Number, required: true, default: 2 },
    memoryLimitMb: { type: Number, required: true, default: 256 },
  },
  { timestamps: true },
);

export const QuestionModel = mongoose.model<QuestionEntity>('Question', QuestionSchema);
