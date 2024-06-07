import type { Agent } from 'node:http';

import {
  APIClient,
  type DefaultQuery,
  type Fetch,
  type FinalRequestOptions,
  type Headers,
} from 'openai/core';

import * as API from './resources';

export interface MinimaxAIOptions {
  baseURL?: string;
  orgId?: string;
  apiKey?: string;
  timeout?: number | undefined;
  httpAgent?: Agent;
  fetch?: Fetch | undefined;
  defaultHeaders?: Headers;
  defaultQuery?: DefaultQuery;
}

export class MinimaxAI extends APIClient {
  protected orgId: string;

  protected apiKey: string;

  private _options: MinimaxAIOptions;

  constructor(options: MinimaxAIOptions = {}) {
    const {
      orgId = process.env.MINIMAX_API_ORG || '',
      apiKey = process.env.MINIMAX_API_KEY || '',
      baseURL = 'https://api.minimax.chat/v1',
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
    this.orgId = orgId;
  }

  audio = new API.Audio(this);

  chat = new API.Chat(this);

  embeddings = new API.Embeddings(this);

  protected authHeaders(): Headers {
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
    return {
      GroupId: this.orgId,
      ...this._options.defaultQuery,
    };
  }
}

// eslint-disable-next-line no-redeclare
export namespace MinimaxAI {
  export type Chat = API.Chat;
  export type ChatModel = API.ChatModel;
  export type ChatCompletionCreateParams = API.ChatCompletionCreateParams;
  export type ChatCompletionCreateParamsNonStreaming =
    API.ChatCompletionCreateParamsNonStreaming;
  export type ChatCompletionCreateParamsStreaming =
    API.ChatCompletionCreateParamsStreaming;

  export type Embeddings = API.Embeddings;
  export type EmbeddingCreateParams = API.EmbeddingCreateParams;

  export type Audio = API.Audio;
}

export default MinimaxAI;
