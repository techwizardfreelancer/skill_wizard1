import { LanguageConfig } from './types';

export const GoConfig: LanguageConfig = {
  language: 'go',
  sourceFileName: 'main.go',
  executableName: 'main',
  dockerImage: 'golang:1.22-alpine',
  compileCommand: 'go build -o main main.go',
  runCommand: './main',
  memoryLimitMb: 256,
  compileTimeoutMs: 15000,
  runTimeoutMs: 5000,
};
