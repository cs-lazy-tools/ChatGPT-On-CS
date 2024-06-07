import { randomUUID } from 'crypto';
import OpenAI from 'openai';
import { Stream } from 'openai/streaming';

import { ensureArray } from '../../../util';
import { APIResource } from '../../resource';

export class Completions extends APIResource {
  /**
   * Creates a model response for the given chat conversation.
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
    const { stream, model } = params;
    const body = this.buildCreateParams(params);
    const path = `/models/${model}:generateContent`;

    const response: Response = await this._client.post(path, {
      ...options,
      query: stream ? { alt: 'sse' } : {},
      body: body as unknown as Record<string, unknown>,
      stream: false,
      __binaryResponse: true,
    });

    if (stream) {
      const controller = new AbortController();

      options?.signal?.addEventListener('abort', () => {
        controller.abort();
      });

      return this.afterSSEResponse(model, response, controller);
    }

    return this.afterResponse(model, response);
  }

  protected buildCreateParams(params: ChatCompletionCreateParams) {
    const {
      messages = [],
      max_tokens,
      top_p,
      top_k,
      stop,
      temperature,
    } = params;

    function formatContentParts(
      content: string | OpenAI.ChatCompletionContentPart[],
    ) {
      const parts: GeminiChat.Part[] = [];

      if (typeof content === 'string') {
        parts.push({ text: content });
        return parts;
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const part of content) {
        if (part.type === 'text') {
          parts.push({ text: part.text });
        } else {
          // TODO: Handle images
          // parts.push({
          //   inline_data: {
          //     "mime_type": "image/jpeg",
          //     "data": "'$(base64 -w0 image.jpg)'"
          //   }
          // });
        }
      }

      return parts;
    }

    function formatRole(role: string): 'user' | 'model' {
      return role === 'user' ? 'user' : 'model';
    }

    const generationConfig: GeminiChat.GenerationConfig = {};

    const data: GeminiChat.GenerateContentRequest = {
      contents: messages.map((item) => {
        return {
          role: formatRole(item.role),
          parts: formatContentParts(item.content!),
        };
      }),
      generationConfig,
    };

    if (temperature != null) {
      generationConfig.temperature = temperature;
    }

    if (top_k != null) {
      generationConfig.topK = top_k;
    }

    if (top_p != null) {
      generationConfig.topP = top_p;
    }

    if (stop != null) {
      generationConfig.stopSequences = ensureArray(stop);
    }

    if (max_tokens != null) {
      generationConfig.maxOutputTokens = max_tokens;
    }

    return data;
  }

  protected async afterResponse(
    model: string,
    response: Response,
  ): Promise<OpenAI.ChatCompletion> {
    const data: GeminiChat.GenerateContentResponse = await response.json();
    const choices: OpenAI.ChatCompletion.Choice[] = data.candidates!.map(
      (item) => {
        const [part] = item.content.parts;

        const choice: OpenAI.ChatCompletion.Choice = {
          index: item.index,
          message: {
            role: 'assistant',
            content: part.text!,
          },
          logprobs: null,
          finish_reason: 'stop',
        };

        switch (item.finishReason) {
          case 'MAX_TOKENS':
            choice.finish_reason = 'length';
            break;
          case 'SAFETY':
          case 'RECITATION':
            choice.finish_reason = 'content_filter';
            break;
          default:
            choice.finish_reason = 'stop';
        }

        return choice;
      },
    );

    return {
      id: randomUUID(),
      model,
      choices,
      object: 'chat.completion',
      created: Date.now() / 10,
      // TODO 需要支持 usage
      usage: {
        completion_tokens: 0,
        prompt_tokens: 0,
        total_tokens: 0,
      },
    };
  }

  protected afterSSEResponse(
    model: string,
    response: Response,
    controller: AbortController,
  ): Stream<OpenAI.ChatCompletionChunk> {
    const stream = Stream.fromSSEResponse<GeminiChat.GenerateContentResponse>(
      response,
      controller,
    );

    const toChoices = (data: GeminiChat.GenerateContentResponse) => {
      return data.candidates!.map((item) => {
        const [part] = item.content.parts;

        const choice: OpenAI.ChatCompletionChunk.Choice = {
          index: item.index,
          delta: {
            role: 'assistant',
            content: part.text || '',
          },
          finish_reason: null,
        };

        switch (item.finishReason) {
          case 'MAX_TOKENS':
            choice.finish_reason = 'length';
            break;
          case 'SAFETY':
          case 'RECITATION':
            choice.finish_reason = 'content_filter';
            break;
          default:
            choice.finish_reason = 'stop';
        }

        return choice;
      });
    };

    async function* iterator(): AsyncIterator<
      OpenAI.ChatCompletionChunk,
      any,
      undefined
    > {
      // eslint-disable-next-line no-restricted-syntax
      for await (const chunk of stream) {
        yield {
          id: randomUUID(),
          model,
          choices: toChoices(chunk),
          object: 'chat.completion.chunk',
          created: Date.now() / 10,
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

namespace GeminiChat {
  export interface GenerationConfig {
    candidateCount?: number;
    stopSequences?: string[];
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
  }

  export interface GenerateContentCandidate {
    index: number;
    content: Content;
    finishReason?:
      | 'FINISH_REASON_UNSPECIFIED'
      | 'STOP'
      | 'MAX_TOKENS'
      | 'SAFETY'
      | 'RECITATION'
      | 'OTHER';
    finishMessage?: string;
    citationMetadata?: CitationMetadata;
  }

  export interface GenerateContentResponse {
    candidates?: GenerateContentCandidate[];
    // promptFeedback?: PromptFeedback;
  }

  export interface CitationMetadata {
    citationSources: CitationSource[];
  }

  export interface CitationSource {
    startIndex?: number;
    endIndex?: number;
    uri?: string;
    license?: string;
  }

  export interface InputContent {
    parts: string | Array<string | Part>;
    role: string;
  }

  export interface Content extends InputContent {
    parts: Part[];
  }

  export type Part = TextPart | InlineDataPart;

  export interface TextPart {
    text: string;
    inlineData?: never;
  }

  export interface InlineDataPart {
    text?: never;
    inlineData: GeminiContentBlob;
  }

  export interface GeminiContentBlob {
    mimeType: string;
    data: string;
  }

  export interface BaseParams {
    generationConfig?: GenerationConfig;
  }

  export interface GenerateContentRequest extends BaseParams {
    contents: Content[];
  }
}
