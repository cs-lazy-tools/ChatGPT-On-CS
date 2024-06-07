import { createHmac } from 'node:crypto';

import OpenAI, { APIError } from 'openai';
import { Stream } from 'openai/streaming';

import { APIResource } from '../../resource';

export class Completions extends APIResource {
  /**
   * Creates a model response for the given chat conversation.
   *
   * See https://cloud.tencent.com/document/product/1729/97732
   */
  create(
    body: ChatCompletionCreateParamsNonStreaming,
    options?: OpenAI.RequestOptions,
  ): Promise<OpenAI.ChatCompletion>;

  create(
    body: ChatCompletionCreateParamsStreaming,
    options?: OpenAI.RequestOptions,
  ): Promise<Stream<OpenAI.ChatCompletionChunk>>;

  async create(
    params: ChatCompletionCreateParams,
    options?: OpenAI.RequestOptions,
  ): Promise<OpenAI.ChatCompletion | Stream<OpenAI.ChatCompletionChunk>> {
    const client = this._client;
    const { model, messages, temperature = 0.8, top_p, stream } = params;

    const timestamp = Math.floor(Date.now() / 1000);

    const body: ChatCompletions.ChatCompletionCreateParams = {
      app_id: client.appId,
      secret_id: client.secretId,
      timestamp,
      expired: timestamp + 7200,
      temperature,
      top_p,
      stream: stream ? 1 : 0,
      messages,
    };

    const path = '/chat/completions';

    const signature = client.generateAuthorization(path, body);

    const response: Response = await this._client.post(path, {
      ...options,
      body,
      headers: {
        ...options?.headers,
        Authorization: signature,
      },
      stream: false,
      __binaryResponse: true,
    });

    if (params.stream) {
      const controller = new AbortController();

      options?.signal?.addEventListener('abort', () => {
        controller.abort();
      });

      return Completions.fromSSEResponse(
        model,
        Stream.fromSSEResponse(response, controller),
        controller,
      );
    }

    return Completions.fromResponse(model, await response.json());
  }

  static fromSSEResponse(
    model: string,
    stream: Stream<ChatCompletions.ChatCompletion>,
    controller: AbortController,
  ): Stream<OpenAI.ChatCompletionChunk> {
    async function* iterator(): AsyncIterator<
      OpenAI.ChatCompletionChunk,
      any,
      undefined
    > {
      // eslint-disable-next-line no-restricted-syntax
      for await (const chunk of stream) {
        if (chunk.error) {
          throw new APIError(undefined, chunk.error, undefined, undefined);
        }

        const message = chunk.choices[0];

        const choice: OpenAI.ChatCompletionChunk.Choice = {
          index: 0,
          delta: {
            role: 'assistant',
            content: message.delta.content || '',
          },
          finish_reason: null,
        };

        yield {
          id: chunk.id,
          model,
          choices: [choice],
          object: 'chat.completion.chunk',
          created: parseInt(chunk.created, 10),
        };
      }
    }

    return new Stream(iterator, controller);
  }

  static fromResponse(
    model: string,
    data: ChatCompletions.ChatCompletion,
  ): OpenAI.ChatCompletion {
    if (data.error) {
      throw new APIError(undefined, data.error, undefined, undefined);
    }

    const message = data.choices[0];

    const choice: OpenAI.ChatCompletion.Choice = {
      index: 0,
      message: {
        role: 'assistant',
        content: message.messages.content,
      },
      logprobs: null,
      finish_reason: message.finish_reason,
    };

    return {
      id: data.id,
      model,
      choices: [choice],
      created: parseInt(data.created, 10),
      object: 'chat.completion',
      usage: data.usage,
    };
  }

  protected hash(data: string) {
    const hash = createHmac('sha1', this._client.secretKey);
    return hash.update(Buffer.from(data, 'utf8')).digest('base64');
  }
}

export interface ChatCompletionCreateParamsNonStreaming
  extends OpenAI.ChatCompletionCreateParamsNonStreaming {
  model: ChatModel;
}

export interface ChatCompletionCreateParamsStreaming
  extends OpenAI.ChatCompletionCreateParamsStreaming {
  model: ChatModel;
}

export type ChatCompletionCreateParams =
  | ChatCompletionCreateParamsNonStreaming
  | ChatCompletionCreateParamsStreaming;

export type ChatModel = 'hunyuan';

export namespace ChatCompletions {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export interface ChatCompletionCreateParams {
    /**
     * 腾讯云账号的 APPID
     */
    app_id: number;

    /**
     * API 密钥
     */
    secret_id: string;

    /**
     * 当前 UNIX 时间戳，单位为秒，可记录发起 API 请求的时间。
     */
    timestamp: number;

    /**
     * 签名的有效期，是一个符合 UNIX Epoch 时间戳规范的数值，单位为秒；Expired 必须与 Timestamp 的差值小于90天
     */
    expired: number;

    /**
     * 请求 ID，用于问题排查
     */
    query_id?: string;

    /**
     * 内容随机性
     */
    temperature?: number | null;

    /**
     * 生成结果的多样性
     */
    top_p?: number | null;

    /**
     * 是否返回流式结果
     *
     * 0：同步，1：流式 （默认，协议：SSE)
     *
     * 同步请求超时：60s，如果内容较长建议使用流式
     */
    stream?: number | null;

    /**
     * 会话内容,  按对话时间序排列，长度最多为40
     * 最大支持16k tokens上下文
     */
    messages: OpenAI.ChatCompletionMessageParam[];
  }

  export type CompletionChoicesDelta = {
    content: string;
  };

  export type CompletionChoice = {
    finish_reason: 'stop';
    /**
     * 内容，同步模式返回内容，流模式为 null
     */
    messages: OpenAI.ChatCompletionMessage;
    /**
     * 内容，流模式返回内容，同步模式为 null
     */
    delta: CompletionChoicesDelta;
  };

  export interface ChatCompletion {
    choices: CompletionChoice[];
    created: string;
    note: string;
    id: string;
    usage: OpenAI.CompletionUsage;

    error?: {
      message: string;
      code: number;
    };
  }
}
