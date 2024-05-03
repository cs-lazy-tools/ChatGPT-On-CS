import fs from 'fs';
import path from 'path';
import { getTempPath } from '../utils';

const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_LOG_FILES = 10;

// 在临时文件夹中创建一个名为 chatgpt-on-cs 的目录用于存放日志
const logDir = getTempPath();

// 定义日志文件的路径
let logFilePath = path.join(logDir, 'renderer.log');

function rotateLogs() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const newLogFilePath = path.join(logDir, `renderer-${timestamp}.log`);
  fs.renameSync(logFilePath, newLogFilePath);

  const logFiles = fs.readdirSync(logDir).sort();
  while (logFiles.length > MAX_LOG_FILES) {
    const oldestLogFile = logFiles.shift();

    // 如果没有最旧的日志文件，则退出循环
    if (!oldestLogFile) {
      break;
    }

    fs.unlinkSync(path.join(logDir, oldestLogFile));
  }

  logFilePath = path.join(logDir, 'renderer.log');
}

function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  const logSize = fs.existsSync(logFilePath)
    ? fs.statSync(logFilePath).size
    : 0;
  if (logSize + logMessage.length > MAX_LOG_SIZE) {
    rotateLogs();
  }

  fs.appendFileSync(logFilePath, logMessage);
}

// const isDebug =
//   process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = (...args) => {
  originalConsoleLog(...args);
  // if (!isDebug) return;

  logToFile(
    `INFO: ${args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')}`,
  );
};

console.error = (...args) => {
  originalConsoleError(...args);
  logToFile(
    `ERROR: ${args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')}`,
  );
};

console.warn = (...args) => {
  originalConsoleWarn(...args);
  logToFile(
    `WARN: ${args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')}`,
  );
};

process.on('uncaughtException', (error) => {
  console.error('An error occurred in the main process:', error);
  console.error(error.stack);
});
