// File generated from our OpenAPI spec by Stainless.
import { APIResource } from '../../../resource';
import { Speech } from './speech';

export class Audio extends APIResource {
  speech = new Speech(this._client);
}
