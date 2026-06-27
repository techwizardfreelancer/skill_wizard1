import { LanguageConfig } from './types';

export const CSharpConfig: LanguageConfig = {
  language: 'csharp',
  sourceFileName: 'Program.cs',
  executableName: 'Program.dll',
  dockerImage: 'mcr.microsoft.com/dotnet/sdk:8.0-alpine',
  compileCommand: 'dotnet build -o /workspace/out',
  runCommand: 'dotnet /workspace/out/Program.dll',
  memoryLimitMb: 256,
  compileTimeoutMs: 20000,
  runTimeoutMs: 5000,
};
