import { createHmac } from 'node:crypto';
import type { Agent } from 'node:http';

import {
  APIClient,
  type DefaultQuery,
  type Fetch,
  type FinalRequestOptions,
  type Headers,
} from 'openai/core';

import * as API from './resources';

export interface HunYuanAIOptions {
  baseURL?: string;
  appId?: string;
  secretId?: string;
  secretKey?: string;
  timeout?: number | undefined;
  httpAgent?: Agent;
  fetch?: Fetch | undefined;
  /**
   * Default headers to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * header to `undefined` or `null` in request options.
   */
  defaultHeaders?: Headers;

  /**
   * Default query parameters to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * param to `undefined` in request options.
   */
  defaultQuery?: DefaultQuery;
}

export class HunYuanAI extends APIClient {
  appId: number;

  secretId: string;

  secretKey: string;

  private _options: HunYuanAIOptions;

  constructor(options: HunYuanAIOptions = {}) {
    const {
      appId = process.env.HUNYUAN_APP_ID || '',
      secretId = process.env.HUNYUAN_SECRET_ID || '',
      secretKey = process.env.HUNYUAN_SECRET_KEY || '',
      baseURL = 'https://hunyuan.cloud.tencent.com/hyllm/v1',
      timeout = 30000,
      httpAgent = undefined,
      ...rest
    } = options;

    super({
      baseURL,
      timeout,
      fetch,
      httpAgent,
      ...rest,
    });

    this._options = options;

    this.appId = parseInt(appId, 10);
    this.secretKey = secretKey;
    this.secretId = secretId;
  }

  chat = new API.Chat(this);

  protected override defaultHeaders(opts: FinalRequestOptions): Headers {
    return {
      ...super.defaultHeaders(opts),
      ...this._options.defaultHeaders,
    };
  }

  protected override defaultQuery(): DefaultQuery | undefined {
    return this._options.defaultQuery;
  }

  generateAuthorization(path: string, data: Record<string, any>) {
    const rawSessionKey = this.buildURL(path, {}).replace('https://', '');

    const rawSignature: string[] = [];

    Object.keys(data)
      .sort()
      .forEach((key) => {
        const value = data[key];

        if (value == null) return;

        if (typeof value === 'object') {
          rawSignature.push(`${key}=${JSON.stringify(value)}`);
        } else {
          rawSignature.push(`${key}=${value}`);
        }
      });

    return this.hash(`${rawSessionKey}?${rawSignature.join('&')}`);
  }

  protected hash(data: string) {
    const hash = createHmac('sha1', this.secretKey);
    return hash.update(Buffer.from(data, 'utf8')).digest('base64');
  }
}

// eslint-disable-next-line no-redeclare
export namespace HunYuanAI {
  export type ChatModel = API.ChatModel;
  export type ChatCompletionCreateParams = API.ChatCompletionCreateParams;
  export type ChatCompletionCreateParamsStreaming =
    API.ChatCompletionCreateParamsStreaming;
  export type ChatCompletionCreateParamsNonStreaming =
    API.ChatCompletionCreateParamsNonStreaming;
}

export default HunYuanAI;
