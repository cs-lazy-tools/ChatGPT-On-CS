import { spawn, exec } from 'child_process';
import { createServer } from 'net';
import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';

class BackendServiceManager {
  private executablePath: string;

  private process: ReturnType<typeof spawn> | null;

  private port: number;

  private autoRestart: boolean; // 新增自动重启标志

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

    const port = await this.getAvailablePort();
    this.port = port;

    this.launchProcess(port);

    // 监听退出事件并可能重启
    this.process?.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      if (this.autoRestart) {
        console.log('Attempting to restart...');
        this.start().catch((err) => console.error('Failed to restart:', err));
      }
    });
  }

  private launchProcess(port: number) {
    // 获取系统的临时文件夹路径
    const tempDir = os.tmpdir();
    // 在临时文件夹中创建一个名为 chatgpt-on-cs 的目录用于存放日志
    const logDir = path.join(tempDir, 'chatgpt-on-cs');
    // 如果目录不存在，则创建它
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    // 定义日志文件的路径
    const logFilePath = path.join(logDir, 'process.log');
    // 创建一个写入流
    const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

    this.process = spawn(this.executablePath, ['--port', port.toString()]);

    this.process.stdout?.on('data', (data) => {
      console.log(`stdout: ${data}`); // 可选：依然在控制台输出
      logStream.write(`stdout: ${data}`); // 写入文件
    });

    this.process.stderr?.on('data', (data) => {
      console.error(`stderr: ${data}`); // 可选：依然在控制台输出
      logStream.write(`stderr: ${data}`); // 写入文件
    });

    // 监听进程关闭事件，关闭写入流
    this.process.on('close', () => {
      logStream.close();
    });
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

  async check_health() {
    // 发送 HTTP 请求检查服务是否健康
    try {
      const {
        data: { data },
      } = await axios.get(`http://127.0.0.1:${this.port}/api/v1/base/health`);
      return data.init_db;
    } catch (error) {
      return false;
    }
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
