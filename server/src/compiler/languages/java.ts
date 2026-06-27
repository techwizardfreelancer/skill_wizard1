import { LanguageConfig } from './types';

export const JavaConfig: LanguageConfig = {
  language: 'java',
  sourceFileName: 'Main.java',
  executableName: 'Main',
  dockerImage: 'eclipse-temurin:20-jdk-alpine',
  compileCommand: 'javac Main.java',
  runCommand: 'java Main',
  memoryLimitMb: 256,
  compileTimeoutMs: 15000,
  runTimeoutMs: 5000,
};
