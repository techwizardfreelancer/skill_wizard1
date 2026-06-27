import { LanguageConfig } from './types';

export const RustConfig: LanguageConfig = {
  language: 'rust',
  sourceFileName: 'main.rs',
  executableName: 'main',
  dockerImage: 'rust:1.79-alpine',
  compileCommand: 'rustc main.rs -o main',
  runCommand: './main',
  memoryLimitMb: 256,
  compileTimeoutMs: 20000,
  runTimeoutMs: 5000,
};
