import {
  type RequestInfo,
  type RequestInit,
  type Response,
} from 'openai/_shims/index';

declare global {
  export function fetch(
    input: RequestInfo,
    init?: RequestInit,
  ): Promise<Response>;
}
