import type { HunYuanAI } from './index';

export class APIResource {
  protected _client: HunYuanAI;

  constructor(client: HunYuanAI) {
    this._client = client;
  }
}
