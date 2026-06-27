import { TestCase } from './Submission';

export interface QuestionDocument {
  _id: string;
  title: string;
  description: string;
  language: string;
  visibleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
  sampleTestCases: TestCase[];
  timeLimitSeconds: number;
  memoryLimitMb: number;
}
