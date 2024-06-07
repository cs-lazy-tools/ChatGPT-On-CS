import type { GeminiAI } from './index';

export class APIResource {
  protected _client: GeminiAI;

  constructor(client: GeminiAI) {
    this._client = client;
  }
}
