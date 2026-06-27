import { LanguageConfig } from './types';

export const PythonConfig: LanguageConfig = {
  language: 'python',
  sourceFileName: 'main.py',
  executableName: 'main.py',
  dockerImage: 'python:3.12-alpine',
  compileCommand: 'true',
  runCommand: 'python main.py',
  memoryLimitMb: 256,
  compileTimeoutMs: 1000,
  runTimeoutMs: 5000,
};
