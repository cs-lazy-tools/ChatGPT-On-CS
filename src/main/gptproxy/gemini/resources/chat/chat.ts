import { Completions } from './completions';
import { APIResource } from '../../resource';

export class Chat extends APIResource {
  completions = new Completions(this._client);
}
