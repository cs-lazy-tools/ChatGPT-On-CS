import { APIError } from 'openai';

/**
 * 构建错误
 *
 * @param code -
 * @param message -
 * @returns 错误
 */
export function makeAPIError(code: number, message: string) {
  const error = { code, message };

  switch (code) {
    case 2:
      return APIError.generate(500, error, message, {});
    case 6: // permission error
    case 111: // token expired
      return APIError.generate(403, error, message, {});
    case 17:
    case 18:
    case 19:
    case 40407:
      return APIError.generate(429, error, message, {});
    case 110: // invalid token
    case 40401: // invalid token
      return APIError.generate(401, error, message, {});
    case 336003: // invalid parameter
      return APIError.generate(400, error, message, {});
    case 336100: // try again
      return APIError.generate(500, error, message, {});
    default:
      return APIError.generate(undefined, error, message, {});
  }
}

/**
 * 如果 code 不为 0，抛出 APIError
 *
 * @param code -
 * @param message -
 */
export function assertNonZero(code: number, message: string) {
  if (code === 0) return;

  throw makeAPIError(code, message);
}
