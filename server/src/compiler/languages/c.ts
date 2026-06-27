import { LanguageConfig } from './types';

export const CConfig: LanguageConfig = {
  language: 'c',
  sourceFileName: 'main.c',
  executableName: 'main',
  dockerImage: 'gcc:13.2.0',
  compileCommand: 'gcc main.c -o main',
  runCommand: './main',
  memoryLimitMb: 256,
  compileTimeoutMs: 10000,
  runTimeoutMs: 5000,
};
