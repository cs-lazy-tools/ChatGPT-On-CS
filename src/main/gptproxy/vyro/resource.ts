import type { VYroAI } from './index';

export class APIResource {
  protected _client: VYroAI;

  constructor(client: VYroAI) {
    this._client = client;
  }
}
