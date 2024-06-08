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
    });

    if (stream) {
      const controller = new AbortController();

      options?.signal?.addEventListener('abort', () => {
        controller.abort();
      });

      return this.afterSSEResponse(response, controller);
    }
  }

  private async afterSSEResponse(
    response: Response,
    controller: AbortController,
  ): Promise<Stream<OpenAI.ChatCompletionChunk>> {
    const reader = response.body?.getReader();

    // eslint-disable-next-line func-names
    const iterator = async function* () {
      let buffer = '';

      while (true) {
        // eslint-disable-next-line no-await-in-loop, no-unsafe-optional-chaining
        const { done, value } = await reader?.read()!;
        if (done) {
          break;
        }

        buffer += new TextDecoder('utf-8').decode(value);
        const lines = buffer.split('\n');

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line === '') continue;

          try {
            const cleanedLine = line.replace(/^data: /, '').trim();
            if (cleanedLine.startsWith('{') && cleanedLine.endsWith('}')) {
              const chunkObj = JSON.parse(
                cleanedLine,
              ) as OpenAI.ChatCompletionChunk;
              yield chunkObj;
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }

        buffer = lines[lines.length - 1];
      }
    };

    controller.signal.addEventListener('abort', () => {
      reader?.cancel();
    });

    return new Stream(iterator, controller);
  }

  protected async afterResponse(
    model: string,
    response: Response,
  ): Promise<OpenAI.ChatCompletion> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`,
      );
    }

    const controller = new AbortController();

    const stream = await this.afterSSEResponse(response, controller);

    const chunks: OpenAI.ChatCompletionChunk[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    // 将收集到的chunks合并成一个ChatCompletion对象
    const chatCompletion: OpenAI.ChatCompletion = this.mergeChunks(chunks);

    return chatCompletion;
  }

  private mergeChunks(
    chunks: OpenAI.ChatCompletionChunk[],
  ): OpenAI.ChatCompletion {
    // 根据需要合并 chunks 成 ChatCompletion
    // 这里假设 OpenAI.ChatCompletion 与 OpenAI.ChatCompletionChunk 结构相似
    const merged: OpenAI.ChatCompletion = {
      id: chunks[0].id,
      created: chunks[0].created,
      model: chunks[0].model,
      choices: chunks.flatMap((chunk) => chunk.choices),
      usage: chunks.reduce(
        (acc, chunk) => {
          acc.prompt_tokens += chunk.usage.prompt_tokens;
          acc.completion_tokens += chunk.usage.completion_tokens;
          acc.total_tokens += chunk.usage.total_tokens;
          return acc;
        },
        { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      ),
    };

    return merged;
  }

  protected buildCreateBody(params: ChatCompletionCreateParams) {
    const { messages = [] } = params;
    const lastMessage = messages[messages.length - 1];

    const queryString = `这是聊天的历史记录:\n'''\n${messages
      .slice(0, -1)
      .map((message) => `${message.role}: ${message.content}`)
      .join('\n')}\n'''\n\n这是我的最新问题:\n${lastMessage.content}`;

    return {
      query: queryString,
      user: 'apiuser',
      auto_generate_name: false,
      response_mode: 'streaming',
    };
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
    answer: string;
  }
}
