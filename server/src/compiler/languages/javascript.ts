import { LanguageConfig } from './types';

export const JavaScriptConfig: LanguageConfig = {
  language: 'javascript',
  sourceFileName: 'main.js',
  executableName: 'main.js',
  dockerImage: 'node:22-alpine',
  compileCommand: 'true',
  runCommand: 'node main.js',
  memoryLimitMb: 256,
  compileTimeoutMs: 1000,
  runTimeoutMs: 5000,
};
