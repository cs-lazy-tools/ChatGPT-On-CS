import { execSync } from 'child_process';
import chalk from 'chalk';

try {
  execSync('electron-builder install-app-deps', { stdio: 'inherit' });
} catch (error) {
  // 错误处理: 输出错误信息和退出码
  console.error(
    chalk.red('Failed to install dependencies with electron-builder:'),
  );
  console.error(chalk.red(`Error message: ${error.message}`)); // 错误消息
  if (error instanceof Error && error.stack) {
    console.error(chalk.red(`Stack trace: ${error.stack}`)); // 堆栈跟踪
  }
  console.error(chalk.red(`Exit code: ${error.status}`)); // 错误码
  process.exit(error.status || 1); // 使用捕获到的退出码作为进程的退出码，或者默认为 1
}
