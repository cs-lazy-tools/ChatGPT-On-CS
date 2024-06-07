import { createHmac } from 'node:crypto';

import {
  APIClient,
  type DefaultQuery,
  type Fetch,
  type Headers,
} from 'openai/core';

import * as API from './resources';

export interface SparkAIOptions {
  baseURL?: string;
  appId?: string;
  apiKey?: string;
  apiSecret?: string;
  timeout?: number | undefined;
  httpAgent?: unknown;
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

export class SparkAI extends APIClient {
  appId: string;

  protected apiKey: string;

  protected apiSecret: string;

  private _options: SparkAIOptions;

  constructor(options: SparkAIOptions = {}) {
    const {
      appId = process.env.SPARK_APP_ID || '',
      apiKey = process.env.SPARK_API_KEY || '',
      apiSecret = process.env.SPARK_API_SECRET || '',
      baseURL = 'https://spark-api.xf-yun.com',
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

    this.appId = appId;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  chat = new API.Chat(this);

  images = new API.Images(this);

  protected override defaultQuery(): DefaultQuery | undefined {
    return this._options.defaultQuery;
  }

  /**
   * @param url - 需要签名的 URL
   * @param method - HTTP method
   * @returns 签名后的 URL
   */
  generateAuthorizationURL(url: string | URL, method: string = 'GET'): string {
    const target = new URL(url, this.baseURL);

    const date = new Date().toUTCString();

    const authorization = this.generateAuthorization({
      method,
      path: target.pathname,
      host: target.host,
      date,
    });

    target.searchParams.set('authorization', authorization);
    target.searchParams.set('host', target.host);
    target.searchParams.set('date', date);

    return target.toString();
  }

  /**
   * 生成鉴权信息
   *
   * See https://www.xfyun.cn/doc/spark/general_url_authentication.html
   */
  generateAuthorization({
    method,
    host,
    path,
    date,
  }: {
    method: string;
    host: string;
    path: string;
    date: string;
  }) {
    // 生成签名原文
    const rawSignature = `host: ${host}\ndate: ${date}\n${method} ${path} HTTP/1.1`;

    // 生成签名，需要转为 base64 编码
    const signature = this.hash(rawSignature);

    return btoa(
      `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`,
    );
  }

  protected hash(data: string) {
    const sha256Hmac = createHmac('sha256', this.apiSecret);
    sha256Hmac.update(data);
    return sha256Hmac.digest('base64');
  }
}

// eslint-disable-next-line no-redeclare
export namespace SparkAI {
  export type Chat = API.Chat;
  export type ChatModel = API.ChatModel;
  export type ChatCompletionCreateParams = API.ChatCompletionCreateParams;
  export type ChatCompletionCreateParamsNonStreaming =
    API.ChatCompletionCreateParamsNonStreaming;
  export type ChatCompletionCreateParamsStreaming =
    API.ChatCompletionCreateParamsStreaming;
}

export default SparkAI;
