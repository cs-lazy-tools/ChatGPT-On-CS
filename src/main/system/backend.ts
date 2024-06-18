import { spawn, exec } from 'child_process';
import { createServer } from 'net';
import fs from 'fs';
import path from 'path';
import { getTempPath } from '../utils';

class BackendServiceManager {
  private executablePath: string;

  private process: ReturnType<typeof spawn> | null;

  private logStream: fs.WriteStream;

  private logFilePath: string;

  private port: number;

  private autoRestart: boolean; // 新增自动重启标志

  private MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB

  private MAX_LOG_FILES = 10;

  constructor(executablePath: string, autoRestart: boolean = true) {
    this.executablePath = executablePath;
    this.process = null;
    this.port = 0;
    this.autoRestart = autoRestart; // 是否自动重启
  }

  async start() {
    if (process.env.NODE_ENV === 'development') {
      this.port = 9999;
      return;
    }

    // 避免重复启动时端口冲突
    if (!this.port) {
      const port = await this.getAvailablePort();
      this.port = port;
    }

    this.launchProcess(this.port);

    // 监听退出事件并可能重启
    this.process?.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      if (this.autoRestart) {
        console.log('Attempting to restart...');
        this.start().catch((err) => console.error('Failed to restart:', err));
      }
    });
  }

  private rotateLogs() {
    this.logStream.close();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const newLogFilePath = this.logFilePath.replace(
      'process.log',
      `process-${timestamp}.log`,
    );
    fs.renameSync(this.logFilePath, newLogFilePath);

    const logFiles = fs.readdirSync(path.dirname(this.logFilePath)).sort();
    while (logFiles.length > this.MAX_LOG_FILES) {
      const oldestLogFile = logFiles.shift();
      if (!oldestLogFile) {
        break;
      }
      fs.unlinkSync(path.join(path.dirname(this.logFilePath), oldestLogFile));
    }

    this.logFilePath = path.join(path.dirname(this.logFilePath), 'process.log');
    this.logStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
  }

  private checkLogSizeAndRotate() {
    const logSize = fs.existsSync(this.logFilePath)
      ? fs.statSync(this.logFilePath).size
      : 0;
    if (logSize > this.MAX_LOG_SIZE) {
      this.rotateLogs();
    }
  }

  private launchProcess(port: number) {
    const logDir = getTempPath();
    this.logFilePath = path.join(logDir, 'process.log');
    this.logStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });

    this.process = spawn(this.executablePath, ['--port', port.toString()]);
    console.log(
      `Starting backend process: ${this.executablePath} --port ${port}`,
    );

    this.process.stdout?.on('data', (data) => {
      this.logStream.write(`stdout: ${data}`);
      this.checkLogSizeAndRotate();
    });

    this.process.stderr?.on('data', (data) => {
      this.logStream.write(`stderr: ${data}`);
      this.checkLogSizeAndRotate();
    });

    this.process.on('close', () => {
      this.logStream.close();
    });

    this.process.on('error', (err) => {
      console.error('Failed to start subprocess.', err);
    });

    console.log(`Backend process started with PID: ${this.process.pid}`);
  }

  async getAvailablePort(): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = createServer();
      server.unref();
      server.on('error', reject);
      server.listen(0, () => {
        const { port } = server.address() as { port: number };
        server.close(() => {
          resolve(port);
        });
      });
    });
  }

  stop() {
    // 修改停止方法以标记不自动重启
    return new Promise((resolve, reject) => {
      this.autoRestart = false; // 停止时禁用自动重启
      if (this.process) {
        console.log('Killing process...');
        const { pid } = this.process;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        exec(`taskkill /pid ${pid} /T /F`, (error, stdout, stderr) => {
          this.process = null;
          if (error) {
            reject(error);
            return;
          }
          resolve({});
        });
      } else {
        resolve({});
      }
    });
  }

  getPort() {
    return this.port;
  }
}

export default BackendServiceManager;
