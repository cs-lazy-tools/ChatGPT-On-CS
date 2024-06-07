import { APIResource } from '../../../resource';
import { OpenAIChatCompatibility } from '../../dashscope';
import { Completions } from './completions';

export class Chat extends APIResource {
  completions = new Completions(this._client);
}

export type ChatModel = OpenAIChatCompatibility.ChatModel;
export type ChatCompletionCreateParams =
  OpenAIChatCompatibility.ChatCompletionCreateParams;
export type ChatCompletionCreateParamsNonStreaming =
  OpenAIChatCompatibility.ChatCompletionCreateParams;
export type ChatCompletionCreateParamsStreaming =
  OpenAIChatCompatibility.ChatCompletionCreateParamsStreaming;
