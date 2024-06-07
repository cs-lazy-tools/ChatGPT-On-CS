import OpenAI from 'openai';
import { type Headers } from 'openai/core';
import { Stream } from 'openai/streaming';

import { APIResource } from '../../resource';
import {
  fromCompletionCreateParams,
  getCompletionCreateEndpoint,
  type OpenAICompletionsCompatibility,
  toCompletion,
  toCompletionStream,
} from '../dashscope';

export class Completions extends APIResource {
  /**
   * Creates a completion for the provided prompt and parameters.
   */
  create(
    body: OpenAICompletionsCompatibility.CompletionCreateParamsNonStreaming,
    options?: OpenAI.RequestOptions,
  ): Promise<OpenAI.Completion>;

  create(
    body: OpenAICompletionsCompatibility.CompletionCreateParamsStreaming,
    options?: OpenAI.RequestOptions,
  ): Promise<Stream<OpenAI.Completion>>;

  create(
    body: OpenAICompletionsCompatibility.CompletionCreateParamsBase,
    options?: OpenAI.RequestOptions,
  ): Promise<Stream<OpenAI.Completion> | OpenAI.Completion>;

  async create(
    body: OpenAICompletionsCompatibility.CompletionCreateParams,
    options?: OpenAI.RequestOptions,
  ): Promise<OpenAI.Completion | Stream<OpenAI.Completion>> {
    const headers: Headers = {
      ...options?.headers,
    };

    if (body.stream) {
      headers.Accept = 'text/event-stream';
    }

    const path = getCompletionCreateEndpoint(body.model);
    const params = fromCompletionCreateParams(body);

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

      return toCompletionStream(params, response, controller);
    }

    return toCompletion(params, await response.json());
  }
}

export type CompletionModel = OpenAICompletionsCompatibility.CompletionModel;
export type CompletionCreateParams =
  OpenAICompletionsCompatibility.CompletionCreateParams;
export type CompletionCreateParamsStreaming =
  OpenAICompletionsCompatibility.CompletionCreateParamsStreaming;
export type CompletionCreateParamsNonStreaming =
  OpenAICompletionsCompatibility.CompletionCreateParamsNonStreaming;
