import { LanguageConfig } from './types';

export const CppConfig: LanguageConfig = {
  language: 'cpp',
  sourceFileName: 'main.cpp',
  executableName: 'main',
  dockerImage: 'gcc:13.2.0',
  compileCommand: 'g++ main.cpp -o main',
  runCommand: './main',
  memoryLimitMb: 256,
  compileTimeoutMs: 10000,
  runTimeoutMs: 5000,
};
