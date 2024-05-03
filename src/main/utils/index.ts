import fs from 'fs';
import os from 'os';
import path from 'path';

export const getTempPath = () => {
  const tempDir = os.tmpdir();
  const logDir = path.join(tempDir, 'chatgpt-on-cs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  return logDir;
};
