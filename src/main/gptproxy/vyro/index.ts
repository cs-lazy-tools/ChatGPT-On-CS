import type { Agent } from 'node:http';

import {
  APIClient,
  type DefaultQuery,
  type Fetch,
  type Headers,
} from 'openai/core';

import * as API from './resources';

export interface VYroAIOptions {
  baseURL?: string;
  apiKey?: string;
  timeout?: number | undefined;
  httpAgent?: Agent;
  apiType?: (string & NonNullable<unknown>) | 'api';
  fetch?: Fetch | undefined;
  defaultHeaders?: Headers;
  defaultQuery?: DefaultQuery;
}

export class VYroAI extends APIClient {
  public apiType: (string & NonNullable<unknown>) | 'api';

  protected apiKey: string;

  private _options: VYroAIOptions;

  constructor(options: VYroAIOptions = {}) {
    const {
      apiKey = process.env.VYRO_API_KEY || '',
      apiType = process.env.VYRO_API_TYPE || 'api',
      baseURL = 'https://api.vyro.ai/v1',
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
    this.apiType = apiType;
  }

  images = new API.Images(this);

  protected override authHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  protected override defaultHeaders(): Headers {
    return {
      ...this.authHeaders(),
      ...this._options.defaultHeaders,
    };
  }

  protected override defaultQuery(): DefaultQuery | undefined {
    return this._options.defaultQuery;
  }
}

// eslint-disable-next-line no-redeclare
export namespace VYroAI {
  export type Images = API.Images;
  export type ImageGenerateParams = API.ImageGenerateParams;
}

export default VYroAI;
