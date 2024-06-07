import OpenAI, { APIError } from 'openai';
import { RequestOptions } from 'openai/core';
import { Stream } from 'openai/streaming';

import { APIResource } from '../../resource';

export class Completions extends APIResource {
  protected resources: Record<
    ChatModel,
    {
      domain: string;
      url: string;
    }
  > = {
    'spark-1.5': {
      domain: 'general',
      url: 'wss://spark-api.xf-yun.com/v1.1/chat',
    },
    'spark-2': {
      domain: 'generalv2',
      url: 'wss://spark-api.xf-yun.com/v2.1/chat',
    },
    'spark-3': {
      domain: 'generalv3',
      url: 'wss://spark-api.xf-yun.com/v3.1/chat',
    },
  };

  /**
   * Creates a model response for the given chat conversation.
   *
   * See https://help.aliyun.com/zh/dashscope/developer-reference/api-details
   */
  create(
    body: ChatCompletionCreateParamsNonStreaming,
    options?: RequestOptions,
  ): Promise<OpenAI.ChatCompletion>;

  create(
    body: ChatCompletionCreateParamsStreaming,
    options?: RequestOptions,
  ): Promise<Stream<OpenAI.ChatCompletionChunk>>;

  async create(
    params: ChatCompletionCreateParams,
    options?: RequestOptions,
  ): Promise<Stream<OpenAI.ChatCompletionChunk> | OpenAI.ChatCompletion> {
    const { model, messages, functions, user, ...rest } = params;

    const resource = this.resources[model];

    const url = this._client.generateAuthorizationURL(resource.url, 'GET');

    const body: ChatCompletions.ChatCompletionParameters = {
      header: {
        app_id: this._client.appId,
      },
      parameter: {
        chat: {
          ...rest,
          domain: resource.domain,
        },
      },
      payload: {
        message: {
          text: messages,
        },
      },
    };

    if (functions) {
      body.payload.functions = { text: functions };
    }

    if (user) {
      body.header.uid = user;
    }

    const controller = new AbortController();

    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        controller.abort();
      });
    }

    const ws: WebSocket = new WebSocket(url);

    ws.onopen = () => {
      ws.send(JSON.stringify(body));
    };

    if (params.stream) {
      const readableStream = new ReadableStream({
        pull(ctrl) {
          const encoder = new TextEncoder();

          ws.onmessage = (event) => {
            const data: ChatCompletions.ChatCompletionResponse = JSON.parse(
              event.data,
            );

            const { header, payload } = data;

            if (header.code !== 0) {
              ctrl.error(
                new APIError(undefined, data.header, undefined, undefined),
              );
              return;
            }

            const choices = payload.choices.text;

            const [message] = choices;

            const choice: OpenAI.ChatCompletionChunk.Choice = {
              index: 0,
              delta: {
                role: message.role,
                content: message.content,
              },
              finish_reason: null,
            };

            if (header.status === 2) {
              choice.finish_reason = 'stop';
            }

            if (message.function_call) {
              choice.delta.function_call = message.function_call;
            }

            const completion: OpenAI.ChatCompletionChunk = {
              id: header.sid,
              model,
              choices: [choice],
              object: 'chat.completion.chunk',
              created: Date.now() / 1000,
            };

            ctrl.enqueue(encoder.encode(`${JSON.stringify(completion)}\n`));
          };
          ws.onerror = (error) => {
            ctrl.error(error);
          };
        },
        cancel() {
          ws.close();
        },
      });

      controller.signal.addEventListener('abort', () => {
        ws.close();
      });

      return Stream.fromReadableStream(readableStream, controller);
    }

    return new Promise((resolve, reject) => {
      ws.onmessage = (event) => {
        const data: ChatCompletions.ChatCompletionResponse = JSON.parse(
          event.data,
        );

        const { header, payload } = data;

        // 2 代表完成
        if (header.status !== 2) return;

        const usage = payload.usage.text;
        const choices = payload.choices.text;

        const [message] = choices;

        const choice: OpenAI.ChatCompletion.Choice = {
          index: 0,
          message: {
            role: 'assistant',
            content: message.content,
          },
          logprobs: null,
          finish_reason: 'stop',
        };

        const completion: OpenAI.ChatCompletion = {
          id: header.sid,
          object: 'chat.completion',
          created: Date.now() / 1000,
          model,
          choices: [choice],
          usage: {
            completion_tokens: usage.completion_tokens,
            total_tokens: usage.total_tokens,
            prompt_tokens: usage.prompt_tokens,
          },
        };

        resolve(completion);
      };

      ws.onerror = (error) => reject(error);
    });
  }
}

export interface ChatCompletionCreateParamsNonStreaming
  extends OpenAI.ChatCompletionCreateParamsNonStreaming {
  model: ChatModel;
  top_k?: number | null;
  chat_id?: string | null;
}

export interface ChatCompletionCreateParamsStreaming
  extends OpenAI.ChatCompletionCreateParamsStreaming {
  model: ChatModel;
  top_k?: number | null;
  chat_id?: string | null;
}

export type ChatCompletionCreateParams =
  | ChatCompletionCreateParamsNonStreaming
  | ChatCompletionCreateParamsStreaming;

export type ChatModel = 'spark-1.5' | 'spark-2' | 'spark-3';

export namespace ChatCompletions {
  export type ChatCompletionParameters = {
    header: {
      app_id: string;
      uid?: string;
    };

    parameter: {
      chat: {
        domain: string;
        temperature?: number | null;
        max_tokens?: number | null;
        top_k?: number | null;
        chat_id?: string | null;
      };
    };

    payload: {
      message: {
        text: OpenAI.ChatCompletionMessageParam[];
      };

      functions?: {
        text: OpenAI.ChatCompletionCreateParams.Function[];
      };
    };
  };

  export type ChatCompletionResponse = {
    header: {
      code: number;
      message: string;
      sid: string;
      status: number;
    };
    payload: {
      choices: {
        status: number;
        seq: number;
        text: OpenAI.ChatCompletionMessage[];
      };
      usage: {
        text: {
          question_tokens: number;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
        };
      };
    };
  };
}
