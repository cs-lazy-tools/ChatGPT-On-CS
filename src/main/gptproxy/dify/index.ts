import type { Agent } from 'node:http';

import {
  APIClient,
  type DefaultQuery,
  type Fetch,
  type FinalRequestOptions,
  type Headers,
} from 'openai/core';
import * as API from './resources';

export interface DifyAIOptions {
  baseURL?: string;
  apiKey?: string;
  timeout?: number | undefined;
  httpAgent?: Agent;
  fetch?: Fetch | undefined;
  defaultHeaders?: Headers;
  defaultQuery?: DefaultQuery;
}

export class DifyAI extends APIClient {
  protected apiKey: string;

  private _options: DifyAIOptions;

  constructor(options: DifyAIOptions = {}) {
    const {
      apiKey = process.env.DIFY_API_KEY || '',
      baseURL = 'https://api.dify.ai/v1/',
      timeout = 50000,
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

  completions = new API.Completions(this);

  chat = new API.Chat(this);

  protected override defaultHeaders(opts: FinalRequestOptions): Headers {
    return {
      ...super.defaultHeaders(opts),
      ...this._options.defaultHeaders,
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  protected override defaultQuery(): DefaultQuery | undefined {
    return {
      ...this._options.defaultQuery,
    };
  }
}

export default DifyAI;
