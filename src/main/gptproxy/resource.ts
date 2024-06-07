import { APIClient } from 'openai/core';

export class APIResource<Client extends APIClient = APIClient> {
  protected _client: Client;

  constructor(client: Client) {
    this._client = client;
  }
}
