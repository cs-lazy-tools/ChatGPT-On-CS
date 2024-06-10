import fs from 'fs';
import os from 'os';
import path from 'path';
import socketIo from 'socket.io';

export const getTempPath = () => {
  const tempDir = os.tmpdir();
  const logDir = path.join(tempDir, 'chatgpt-on-cs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  return logDir;
};

export async function emitAndWait<T>(
  io: socketIo.Server,
  event: string,
  data?: any,
  timeout: number = 5000,
): Promise<any> {
  let response;
  if (data === undefined) {
    response = await io.timeout(timeout).emitWithAck(event);
  } else {
    response = await io.timeout(timeout).emitWithAck(event, data);
  }

  // 判断是否是 Array
  if (Array.isArray(response) && response.length === 1) {
    if (typeof response[0] === 'undefined') {
      return {} as T;
    }

    // 如果 response[0] 也是数组，那么直接返回
    if (Array.isArray(response[0])) {
      return response[0] as T;
    }

    if (typeof response[0] === 'string') {
      const obj = JSON.parse(response[0]);
      if (obj.error) {
        throw new Error(obj.error);
      }

      return obj;
    }

    const obj = response[0];
    // 检查返回的对象是否包含 error
    if (obj.error) {
      throw new Error(obj.error);
    }

    return obj;
  }

  // 判断是否是字符串
  if (typeof response === 'string') {
    const obj = JSON.parse(response);
    if (obj.error) {
      throw new Error(obj.error);
    }
    return obj;
  }

  return response;
}
