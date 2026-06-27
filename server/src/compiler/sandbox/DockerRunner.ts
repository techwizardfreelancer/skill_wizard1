import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
const execFileAsync = promisify(execFile);

export interface DockerRunOptions {
  image: string;
  containerName: string;
  command: string;
  mountPath: string;
  workDir: string;
  memoryMb: number;
  cpus: number;
  timeoutMs: number;
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
}

export class DockerRunner {
  public async runContainer(options: DockerRunOptions): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const args = this.buildRunArgs(options);
    try {
      const result = await execFileAsync('docker', args, {
        maxBuffer: 5 * 1024 * 1024,
        timeout: options.timeoutMs,
      });

      return {
        stdout: result.stdout?.toString() || '',
        stderr: result.stderr?.toString() || '',
        exitCode: 0,
      };
    } catch (error: any) {
      await this.cleanupContainer(options.containerName);
      const stderr = error.stderr?.toString() || error.message || 'Unknown Docker error';
      const stdout = error.stdout?.toString() || '';
      return {
        stdout,
        stderr,
        exitCode: error.killed ? 137 : 1,
      };
    }
  }

  public async createContainer(options: DockerRunOptions): Promise<DockerContainer> {
    const id = `sandbox-${Date.now()}-${Math.round(Math.random() * 10000)}`;
    return {
      id,
      name: id,
      image: options.image,
    };
  }

  public async destroyContainer(container: DockerContainer): Promise<void> {
    await execFileAsync('docker', ['rm', '-f', container.name], { timeout: 5000 }).catch(() => undefined);
  }

  private async cleanupContainer(containerName: string): Promise<void> {
    await execFileAsync('docker', ['rm', '-f', containerName], { timeout: 5000 }).catch(() => undefined);
  }

  private buildRunArgs(options: DockerRunOptions): string[] {
    return [
      'run',
      '--rm',
      '--init',
      '--name',
      options.containerName,
      '--network',
      'none',
      '--security-opt',
      'no-new-privileges',
      '--cap-drop',
      'ALL',
      '--read-only',
      '--tmpfs',
      '/tmp:rw,noexec,nosuid,size=64m',
      `--memory=${options.memoryMb}m`,
      '--memory-swap=0',
      `--cpus=${options.cpus}`,
      '--pids-limit=64',
      '-v',
      `${options.mountPath}:/workspace:rw`,
      '-w',
      options.workDir,
      options.image,
      'sh',
      '-c',
      options.command,
    ];
  }
}
