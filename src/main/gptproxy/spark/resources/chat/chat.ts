import { APIResource } from '../../resource';
import { Completions } from './completions';

export class Chat extends APIResource {
  completions = new Completions(this._client);
}
