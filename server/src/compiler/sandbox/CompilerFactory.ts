import { LanguageConfig } from '../languages/types';
import { CConfig } from '../languages/c';
import { CppConfig } from '../languages/cpp';
import { JavaConfig } from '../languages/java';
import { PythonConfig } from '../languages/python';
import { JavaScriptConfig } from '../languages/javascript';
import { GoConfig } from '../languages/go';
import { RustConfig } from '../languages/rust';
import { CSharpConfig } from '../languages/csharp';

export class CompilerFactory {
  private languageConfigs: Record<string, LanguageConfig>;

  constructor() {
    this.languageConfigs = {
      c: CConfig,
      cpp: CppConfig,
      java: JavaConfig,
      python: PythonConfig,
      javascript: JavaScriptConfig,
      go: GoConfig,
      rust: RustConfig,
      csharp: CSharpConfig,
    };
  }

  public getLanguageConfig(language: string): LanguageConfig | undefined {
    return this.languageConfigs[language.toLowerCase()];
  }
}
