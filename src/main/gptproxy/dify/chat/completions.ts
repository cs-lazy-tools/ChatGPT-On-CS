import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import { APIResource } from '../../resource';

// https://docs.dify.ai/v/zh-hans/guides/application-publishing/developing-with-apis
// https://github.com/fatwang2/dify2openai
export class Completions extends APIResource {
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
    const { stream } = params;
    const body = this.buildCreateBody(params);
    const path = '/chat-messages';

    const response: Response = await this._client.post(path, {
      ...options,
      body: body as unknown as Record<string, unknown>,
      // 响应内容被包裹了一层，需要解构并转换为 OpenAI 的格式
      // 设置 __binaryResponse 为 true， 是为了让 client 返回原始的 response
      stream: false,
      __binaryResponse: true,
    });
    const controller = new AbortController();

    options?.signal?.addEventListener('abort', () => {
      controller.abort();
    });

    if (stream) {
      // return this.afterSSEResponse(response, controller);
      return Completions.fromOpenAIStream(
        'your-model-id',
        // @ts-ignore
        Stream.fromSSEResponse(response, controller),
        controller,
      );
    }

    return this.afterResponse(
      Completions.fromOpenAIStream(
        'your-model-id',
        // @ts-ignore
        Stream.fromSSEResponse(response, controller),
        controller,
      ),
    );
  }

  protected async afterResponse(
    stream: Stream<OpenAI.ChatCompletionChunk>,
  ): Promise<OpenAI.ChatCompletion> {
    const choices: OpenAI.ChatCompletion.Choice[] = [];
    const id = `chatcmpl-${Date.now()}`;
    const created = Math.floor(Date.now() / 1000);
    const model = 'your-model-id';
    let system_fingerprint: string | undefined;

    // eslint-disable-next-line no-restricted-syntax
    for await (const chunk of stream) {
      if (chunk.choices) {
        // eslint-disable-next-line no-restricted-syntax
        for (const choice of chunk.choices) {
          if (choice.delta?.content) {
            if (choices[choice.index]) {
              choices[choice.index].message.content += choice.delta.content;
            } else {
              choices[choice.index] = {
                index: choice.index,
                message: {
                  content: choice.delta.content,
                  role: 'assistant',
                },
                logprobs: null,
                finish_reason: 'length',
              };
            }
          }
          if (choice.finish_reason) {
            choices[choice.index].finish_reason = choice.finish_reason;
          }
        }
      }
      if (chunk.system_fingerprint) {
        system_fingerprint = chunk.system_fingerprint;
      }
    }

    return {
      id,
      choices,
      created,
      model,
      object: 'chat.completion',
      system_fingerprint,
      usage: {
        completion_tokens: 0,
        prompt_tokens: 0,
        total_tokens: 0,
      },
    };
  }

  protected buildCreateBody(params: ChatCompletionCreateParams) {
    const { messages = [] } = params;
    const lastMessage = messages[messages.length - 1];

    const queryString = `这是聊天的历史记录:\n'''\n${messages
      .slice(0, -1)
      .map((message) => `${message.role}: ${message.content}`)
      .join('\n')}\n'''\n\n这是我的最新问题:\n${lastMessage.content}`;

    return {
      inputs: {},
      query: queryString,
      user: 'apiuser',
      conversation_id: '',
      auto_generate_name: false,
      response_mode: 'streaming',
    };
  }

  static fromOpenAIStream(
    model: string,
    stream: Stream<any>,
    controller: AbortController,
  ): Stream<OpenAI.ChatCompletionChunk> {
    async function* iterator(): AsyncIterator<
      OpenAI.ChatCompletionChunk,
      any,
      undefined
    > {
      // eslint-disable-next-line no-restricted-syntax
      for await (const chunk of stream) {
        // chunk = {
        //   event: "message",
        //   conversation_id: "8681e2d5-3f39-4f29-bb6d-5fca10a17ef8",
        //   message_id: "a09c1271-8f9d-4f28-8f3e-27930232f9f1",
        //   created_at: 1718175273,
        //   task_id: "bfbd3174-d014-4b81-86df-0f958f685ae1",
        //   id: "a09c1271-8f9d-4f28-8f3e-27930232f9f1",
        //   answer: "Good",
        // }

        // 结束的 chunk
        // end_chunk = {"event": "message_end", "conversation_id": "e7ea9f43-13e5-4562-90a4-33348141319b", "message_id": "d8059e9a-2932-4425-ba87-ae71dba8d3bf", "created_at": 1718175370, "task_id": "f7f050f5-b58f-45e6-9ab3-7d21f1ef1d9e", "id": "d8059e9a-2932-4425-ba87-ae71dba8d3bf", "metadata": {"usage": {"prompt_tokens": 17, "prompt_unit_price": "0.001", "prompt_price_unit": "0.001", "prompt_price": "0.0000170", "completion_tokens": 12, "completion_unit_price": "0.002", "completion_price_unit": "0.001", "completion_price": "0.0000240", "total_tokens": 29, "total_price": "0.0000410", "currency": "USD", "latency": 0.6319410030264407}}}

        const choice: OpenAI.ChatCompletionChunk.Choice = {
          index: 0,
          delta: {
            role: 'assistant',
            content: chunk.answer,
          },
          finish_reason: null,
        };

        if (chunk.event === 'message_end') {
          choice.finish_reason = 'stop';
        }

        // const usage = {
        //   completion_tokens: 0,
        //   prompt_tokens: 0,
        //   total_tokens: 0,
        // };

        // if (chunk.metadata?.usage) {
        //   usage.completion_tokens = chunk.metadata.usage.completion_tokens;
        //   usage.prompt_tokens = chunk.metadata.usage.prompt_tokens;
        //   usage.total_tokens = chunk.metadata.usage.total_tokens;
        // }

        yield {
          id: chunk.id,
          model,
          choices: [choice],
          created: chunk.created_at,
          object: 'chat.completion.chunk',
        };
      }
    }

    return new Stream(iterator, controller);
  }
}

export type ChatCompletionCreateParamsNonStreaming =
  Chat.ChatCompletionCreateParamsNonStreaming;

export type ChatCompletionCreateParamsStreaming =
  Chat.ChatCompletionCreateParamsStreaming;

export type ChatCompletionCreateParams = Chat.ChatCompletionCreateParams;

export type ChatModel = Chat.ChatModel;

export namespace Chat {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export type ChatModel = string & NonNullable<unknown>;

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export interface ChatCompletionCreateParamsNonStreaming
    extends OpenAI.ChatCompletionCreateParamsNonStreaming {
    model: ChatModel;
    top_k?: number;
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export interface ChatCompletionCreateParamsStreaming
    extends OpenAI.ChatCompletionCreateParamsStreaming {
    model: ChatModel;
    top_k?: number | null;
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export type ChatCompletionCreateParams =
    | ChatCompletionCreateParamsNonStreaming
    | ChatCompletionCreateParamsStreaming;
}

export namespace DifyChat {
  export interface GenerateContentResponse {
    event: 'message' | 'agent_message';
    conversation_id: string;
    message_id: string;
    created_at: number;
    task_id: string;
    id: string;
    answer: string;
  }
}
