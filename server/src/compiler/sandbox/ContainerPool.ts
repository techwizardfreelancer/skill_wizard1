import { DockerRunner, DockerContainer, DockerRunOptions } from './DockerRunner';
import { LanguageConfig } from '../languages/types';

export class ContainerPool {
  private dockerRunner: DockerRunner;

  constructor(dockerRunner: DockerRunner) {
    this.dockerRunner = dockerRunner;
  }

  public async allocateContainer(languageConfig: LanguageConfig): Promise<DockerContainer> {
    const containerName = `sandbox-${languageConfig.language}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
    return this.dockerRunner.createContainer({
      image: languageConfig.dockerImage,
      containerName,
      command: 'echo container-ready',
      mountPath: '/tmp',
      workDir: '/workspace',
      memoryMb: languageConfig.memoryLimitMb,
      cpus: 0.5,
      timeoutMs: 10000,
    } as DockerRunOptions);
  }

  public async destroyContainer(container: DockerContainer): Promise<void> {
    await this.dockerRunner.destroyContainer(container);
  }
}
