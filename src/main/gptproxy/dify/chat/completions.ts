import axios from 'axios';
import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import { APIResource } from '../../resource';

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
    const body = this.buildCreateParams(params);
    const path = '/chat-messages';

    const response: Response = await this._client.post(path, {
      ...options,
      body: body as unknown as Record<string, unknown>,
      stream: false,
      __binaryResponse: true,
    });

    if (stream) {
      const controller = new AbortController();

      options?.signal?.addEventListener('abort', () => {
        controller.abort();
      });

      return this.afterSSEResponse(response, controller);
    }

    // if ('stream' in params && params.stream) {
    //   // Streaming request
    //   const stream = new Stream<OpenAI.ChatCompletionChunk>();
    //   try {
    //     const resp = await axios.post(
    //       `${gpt_base_url}/chat-messages`,
    //       {
    //         inputs: {},
    //         query: rest.query,
    //         response_mode: 'streaming',
    //         user: 'apiuser',
    //         auto_generate_name: false,
    //       },
    //       {
    //         headers: {
    //           'Content-Type': 'application/json',
    //           Authorization: `Bearer ${gpt_key}`,
    //         },
    //         responseType: 'stream',
    //       },
    //     );

    //     let buffer = '';

    //     resp.data.on('data', (chunk: any) => {
    //       buffer += chunk.toString();
    //       const lines = buffer.split('\n');

    //       for (let i = 0; i < lines.length - 1; i++) {
    //         const line = lines[i].trim();
    //         if (line === '') continue;
    //         let chunkObj;
    //         try {
    //           const cleanedLine = line.replace(/^data: /, '').trim();
    //           if (cleanedLine.startsWith('{') && cleanedLine.endsWith('}')) {
    //             chunkObj = JSON.parse(cleanedLine);
    //           } else {
    //             continue;
    //           }
    //         } catch (error) {
    //           console.error('Error parsing JSON:', error);
    //           continue;
    //         }

    //         if (
    //           chunkObj.event === 'message' ||
    //           chunkObj.event === 'agent_message'
    //         ) {
    //           stream.push(chunkObj);
    //         }
    //       }

    //       buffer = lines[lines.length - 1];
    //     });

    //     resp.data.on('end', () => {
    //       stream.push(null);
    //     });

    //     resp.data.on('error', (error: Error) => {
    //       stream.emit('error', error);
    //     });
    //   } catch (error) {
    //     stream.emit('error', error);
    //   }

    //   return stream;
    // }

    // // Non-streaming request
    // const response = await axios.post(
    //   `${gpt_base_url}/chat-messages`,
    //   {
    //     inputs: {},
    //     query: rest.query,
    //     response_mode: 'non-streaming',
    //     user: 'apiuser',
    //     auto_generate_name: false,
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${gpt_key}`,
    //     },
    //   },
    // );

    return response.data as OpenAI.ChatCompletion;
  }

  protected buildCreateParams(params: ChatCompletionCreateParams) {
    const { model, top_k, ...rest } = params;
    return {
      ...rest,
      model,
      top_k,
      response_mode: 'streaming',
    };
  }

  protected afterSSEResponse(
    response: Response,
    controller: AbortController,
  ): Stream<OpenAI.ChatCompletionChunk> {
    const stream = Stream.fromSSEResponse<DifyChat.GenerateContentResponse>(
      response,
      controller,
    );

    // response.body.on('data', (chunk: any) => {
    //   const chunkObj = JSON.parse(chunk.toString());

    //   if (chunkObj.event === 'message' || chunkObj.event === 'agent_message') {
    //     stream.push(chunkObj);
    //   }
    // });

    // response.body.on('end', () => {
    //   stream.push(null);
    // });

    // response.body.on('error', (error: Error) => {
    //   stream.emit('error', error);
    // });

    // return stream;

    const toChoices = (chunk: DifyChat.GenerateContentResponse) => {};
  }
}

export type ChatCompletionCreateParamsNonStreaming =
  Chat.ChatCompletionCreateParamsNonStreaming;

export type ChatCompletionCreateParamsStreaming =
  Chat.ChatCompletionCreateParamsStreaming;

export type ChatCompletionCreateParams = Chat.ChatCompletionCreateParams;

export namespace Chat {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export type ChatModel = (string & NonNullable<unknown>) | 'gemini-pro';
  // 支持的有点问题
  // | 'gemini-pro-vision';

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
