import type { Agent } from 'node:http';

import { APIError } from 'openai';
import {
  APIClient,
  type DefaultQuery,
  type Fetch,
  type FinalRequestOptions,
  type Headers,
} from 'openai/core';

import * as API from './resources';

export interface QWenAIOptions {
  baseURL?: string;
  apiKey?: string;
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

/**
 * 基于阿里云 [DashScope 灵积模型服务](https://help.aliyun.com/zh/dashscope/product-overview/product-introduction) 的接口封装
 *
 * @deprecated 请重点关注阿里云的 [OpenAI接口兼容](https://help.aliyun.com/zh/dashscope/developer-reference/compatibility-of-openai-with-dashscope/) 计划。
 */
export class QWenAI extends APIClient {
  protected apiKey: string;

  private _options: QWenAIOptions;

  constructor(options: QWenAIOptions = {}) {
    const {
      apiKey = process.env.QWEN_API_KEY || '',
      baseURL = 'https://dashscope.aliyuncs.com/api/v1/',
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

    this.apiKey = apiKey;
  }

  chat = new API.Chat(this);

  completions = new API.Completions(this);

  embeddings = new API.Embeddings(this);

  images = new API.Images(this);

  protected override authHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  protected override defaultHeaders(opts: FinalRequestOptions): Headers {
    return {
      ...super.defaultHeaders(opts),
      ...this._options.defaultHeaders,
    };
  }

  protected override defaultQuery(): DefaultQuery | undefined {
    return this._options.defaultQuery;
  }

  protected override makeStatusError(
    status: number | undefined,
    error: Record<string, any> | undefined,
    message: string | undefined,
    headers: Headers | undefined,
  ) {
    return APIError.generate(status, { error }, message, headers);
  }
}

// eslint-disable-next-line no-redeclare
export namespace QWenAI {
  export import Chat = API.Chat;
  export import ChatModel = API.ChatModel;
  export import ChatCompletionCreateParams = API.ChatCompletionCreateParams;
  export import ChatCompletionCreateParamsNonStreaming = API.ChatCompletionCreateParamsNonStreaming;
  export import ChatCompletionCreateParamsStreaming = API.ChatCompletionCreateParamsStreaming;

  export import Completions = API.Completions;
  export import CompletionModel = API.CompletionModel;
  export type CompletionCreateParams = API.CompletionCreateParams;
  export type CompletionCreateParamsStreaming =
    API.CompletionCreateParamsStreaming;
  export type CompletionCreateParamsNonStreaming =
    API.CompletionCreateParamsNonStreaming;

  export import Embeddings = API.Embeddings;
  export type EmbeddingModel = API.EmbeddingModel;
  export type EmbeddingCreateParams = API.EmbeddingCreateParams;

  export import Images = API.Images;
  export type ImageModel = API.ImageModel;
  export type ImageGenerateParams = API.ImageGenerateParams;
}

export default QWenAI;
