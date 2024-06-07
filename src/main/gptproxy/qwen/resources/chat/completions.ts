import OpenAI from 'openai';
import { type Headers } from 'openai/core';
import { Stream } from 'openai/streaming';

import { APIResource } from '../../../resource';
import {
  fromChatCompletionCreateParams,
  getCompletionCreateEndpoint,
  type OpenAIChatCompatibility,
  toChatCompletion,
  toChatCompletionStream,
} from '../../dashscope';

export class Completions extends APIResource {
  /**
   * Creates a model response for the given chat conversation.
   *
   * See https://help.aliyun.com/zh/dashscope/developer-reference/api-details
   */
  create(
    body: OpenAIChatCompatibility.ChatCompletionCreateParamsNonStreaming,
    options?: OpenAI.RequestOptions,
  ): Promise<OpenAI.ChatCompletion>;

  create(
    body: OpenAIChatCompatibility.ChatCompletionCreateParamsStreaming,
    options?: OpenAI.RequestOptions,
  ): Promise<Stream<OpenAI.ChatCompletionChunk>>;

  async create(
    body: OpenAIChatCompatibility.ChatCompletionCreateParams,
    options?: OpenAI.RequestOptions,
  ) {
    const headers: Headers = {
      ...options?.headers,
    };

    if (body.stream) {
      headers.Accept = 'text/event-stream';
    }

    const path = getCompletionCreateEndpoint(body.model);
    const params = fromChatCompletionCreateParams(body);

    const response: Response = await this._client.post(path, {
      ...options,
      body: params,
      headers,
      // 通义千问的响应内容被包裹了一层，需要解构并转换为 OpenAI 的格式
      // 设置 __binaryResponse 为 true， 是为了让 client 返回原始的 response
      stream: false,
      __binaryResponse: true,
    });

    if (body.stream) {
      const controller = new AbortController();

      options?.signal?.addEventListener('abort', () => {
        controller.abort();
      });

      return toChatCompletionStream(params, response, controller);
    }

    return toChatCompletion(params, await response.json());
  }
}
