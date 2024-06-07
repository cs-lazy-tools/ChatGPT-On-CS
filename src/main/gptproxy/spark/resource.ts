import type { SparkAI } from './index';

export class APIResource {
  protected _client: SparkAI;

  constructor(client: SparkAI) {
    this._client = client;
  }
}
