import type { Agent } from 'node:http';

import {
  APIClient,
  type DefaultQuery,
  type Fetch,
  type FinalRequestOptions,
  type Headers,
} from 'openai/core';

import * as API from './resources';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1';

export interface GeminiAIOptions {
  baseURL?: string;
  apiKey?: string;
  timeout?: number | undefined;
  httpAgent?: Agent;
  fetch?: Fetch | undefined;
  defaultHeaders?: Headers;
  defaultQuery?: DefaultQuery;
}

export class GeminiAI extends APIClient {
  apiKey: string;

  private _options: GeminiAIOptions;

  constructor(options: GeminiAIOptions = {}) {
    const {
      apiKey = process.env.GEMINI_API_KEY || '',
      baseURL = process.env.GEMINI_BASE_URL || BASE_URL,
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

  models = new API.Models(this);

  protected override defaultHeaders(opts: FinalRequestOptions): Headers {
    return {
      ...super.defaultHeaders(opts),
      ...this._options.defaultHeaders,
    };
  }

  protected override defaultQuery(): DefaultQuery | undefined {
    return {
      ...this._options.defaultQuery,
      key: this.apiKey,
    };
  }
}

// eslint-disable-next-line no-redeclare
export namespace GeminiAI {
  export type ChatModel = API.ChatModel;
  export type ChatCompletionCreateParams = API.ChatCompletionCreateParams;
  export type ChatCompletionCreateParamsStreaming =
    API.ChatCompletionCreateParamsStreaming;
  export type ChatCompletionCreateParamsNonStreaming =
    API.ChatCompletionCreateParamsNonStreaming;
}

export default GeminiAI;
