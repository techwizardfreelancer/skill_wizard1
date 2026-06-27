export interface LanguageConfig {
  language: string;
  sourceFileName: string;
  executableName: string;
  dockerImage: string;
  compileCommand: string;
  runCommand: string;
  memoryLimitMb: number;
  compileTimeoutMs: number;
  runTimeoutMs: number;
}
