import OpenAI, { APIError, OpenAIError } from 'openai';
import { Stream } from 'openai/streaming';

import { APIResource } from '../../../resource';
import { iterMessages, SSEDecoder } from '../../../streaming';
import { assertStatusCode } from '../../error';

export class Completions extends APIResource {
  protected resources: Record<
    ChatModel,
    {
      model: ChatModel;
      endpoint: string;
    }
  > = {
    'abab5-chat': {
      model: 'abab5-chat',
      endpoint: '/text/chatcompletion',
    },
    'abab5.5-chat': {
      model: 'abab5.5-chat',
      endpoint: '/text/chatcompletion',
    },
    'abab5.5-chat-pro': {
      model: 'abab5.5-chat',
      endpoint: '/text/chatcompletion_pro',
    },
  };

  protected system =
    'MM智能助理是一款由MiniMax自研的，没有调用其他产品的接口的大型语言模型。MiniMax是一家中国科技公司，一直致力于进行大模型相关的研究。';

  /**
   * Creates a model response for the given chat conversation.
   *
   * See https://api.minimax.chat/document/guides/chat-model/chat/api
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
  ) {
    const resource = this.resources[params.model];

    if (!resource) {
      throw new OpenAIError(`Invalid model: ${params.model}`);
    }

    const body = this.buildCreateParams(params);

    const response: Response = await this._client.post(resource.endpoint, {
      ...options,
      body: { ...body, model: resource.model },
      stream: false,
      __binaryResponse: true,
    });

    if (body.stream) {
      const controller = new AbortController();

      options?.signal?.addEventListener('abort', () => {
        controller.abort();
      });

      return Completions.fromSSEResponse(params.model, response, controller);
    }

    return Completions.fromResponse(params.model, await response.json());
  }

  protected buildCreateParams(
    params: ChatCompletionCreateParams,
  ): ChatCompletions.ChatCompletionCreateParams {
    const { model, messages = [], max_tokens, ...rest } = params;

    const data: ChatCompletions.ChatCompletionCreateParams = {
      model,
      messages: [],
      ...rest,
    };

    if (max_tokens) {
      data.tokens_to_generate = max_tokens;
    }

    const head = messages[0];

    // minimax 的 system 是独立字段
    const system = head && head.role === 'system' ? head.content : null;

    // 移除 system 角色的消息
    if (system) {
      messages.splice(0, 1);
    }

    if (model === 'abab5.5-chat-pro') {
      data.bot_setting = [
        {
          bot_name: 'MM智能助理',
          content: system || this.system,
        },
      ];
      data.reply_constraints = {
        sender_type: 'BOT',
        sender_name: 'MM智能助理',
      };
    } else {
      data.role_meta = {
        bot_name: 'MM智能助理',
        user_name: '用户',
      };
      data.prompt = system || this.system;
    }

    data.messages = messages.map((item) => {
      switch (item.role) {
        case 'assistant':
          return {
            sender_type: 'BOT',
            text: item.content as string,
          };
        default: {
          const message: ChatCompletions.ChatMessage = {
            sender_type: 'USER',
            text: item.content as string,
          };

          if (model === 'abab5.5-chat-pro') {
            message.sender_name = '用户';
          }

          return message;
        }
      }
    });

    if (params.stream) {
      data.use_standard_sse = true;
    }

    return data;
  }

  static fromResponse(
    model: ChatModel,
    data: ChatCompletions.ChatCompletion,
  ): OpenAI.ChatCompletion {
    assertStatusCode(data);

    return {
      id: data.id,
      model: data.model,
      choices: data.choices.map((choice, index) => {
        const { finish_reason } = choice;

        if (model === 'abab5.5-chat-pro') {
          return {
            index,
            message: {
              role: 'assistant',
              content: choice.messages[0].text,
            },
            logprobs: null,
            finish_reason,
          };
        }

        return {
          index,
          message: {
            role: 'assistant',
            content: choice.text,
          },
          logprobs: null,
          finish_reason,
        };
      }),
      created: data.created,
      object: 'chat.completion',
      usage: data.usage,
    };
  }

  static fromSSEResponse(
    model: ChatModel,
    response: Response,
    controller: AbortController,
  ): Stream<OpenAI.ChatCompletionChunk> {
    let consumed = false;
    const decoder = new SSEDecoder();

    function transform(
      data: ChatCompletions.ChatCompletionChunk,
    ): OpenAI.ChatCompletionChunk {
      return {
        id: data.request_id,
        model,
        choices: data.choices.map((choice, index) => {
          const { finish_reason = null } = choice;

          if (model === 'abab5.5-chat-pro') {
            const content = choice.messages[0].text;

            return {
              index,
              delta: {
                role: 'assistant',
                content: finish_reason === 'stop' ? '' : content,
              },
              finish_reason,
            };
          }

          return {
            index,
            delta: {
              role: 'assistant',
              content: choice.delta,
            },
            finish_reason,
          };
        }),
        object: 'chat.completion.chunk',
        created: data.created,
      };
    }

    async function* iterator(): AsyncIterator<
      OpenAI.ChatCompletionChunk,
      any,
      undefined
    > {
      if (consumed) {
        throw new Error(
          'Cannot iterate over a consumed stream, use `.tee()` to split the stream.',
        );
      }
      consumed = true;
      let done = false;
      try {
        // eslint-disable-next-line no-restricted-syntax
        for await (const sse of iterMessages(response, decoder, controller)) {
          if (done) continue;

          if (sse.data.startsWith('[DONE]')) {
            done = true;
            continue;
          }

          if (sse.event === null) {
            let data;

            try {
              data = JSON.parse(sse.data);
            } catch (e) {
              console.error(`Could not parse message into JSON:`, sse.data);
              console.error(`From chunk:`, sse.raw);
              throw e;
            }

            if (data && data.code) {
              throw new APIError(undefined, data, undefined, undefined);
            }

            yield transform(data);
          }
        }
        done = true;
      } catch (e) {
        // If the user calls `stream.controller.abort()`, we should exit without throwing.
        if (e instanceof Error && e.name === 'AbortError') return;
        throw e;
      } finally {
        // If the user `break`s, abort the ongoing request.
        if (!done) controller.abort();
      }
    }

    return new Stream(iterator, controller);
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

export type ChatModel = 'abab5-chat' | 'abab5.5-chat' | 'abab5.5-chat-pro';

export namespace ChatCompletions {
  export type ChatMessage = {
    sender_type: 'USER' | 'BOT' | 'FUNCTION';
    sender_name?: string;
    text: string;
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export interface ChatCompletionCreateParams {
    /**
     * 模型名称
     */
    model: ChatModel;

    /**
     * 对话背景、人物或功能设定
     *
     * 和 bot_setting 互斥
     */
    prompt?: string | null;

    /**
     * 对话 meta 信息
     *
     * 和 bot_setting 互斥
     */
    role_meta?: {
      /**
       * 用户代称
       */
      user_name: string;
      /**
       * AI 代称
       */
      bot_name: string;
    };

    /**
     * pro 模式下，可以设置 bot 的名称和内容
     *
     * 和 prompt 互斥
     */
    bot_setting?: {
      bot_name: string;
      content: string;
    }[];

    /**
     * pro 模式下，设置模型回复要求
     */
    reply_constraints?: {
      sender_type: string;
      sender_name: string;
    };

    /**
     * 对话内容
     */
    messages: ChatMessage[];

    /**
     * 如果为 true，则表明设置当前请求为续写模式，回复内容为传入 messages 的最后一句话的续写；
     *
     * 此时最后一句发送者不限制 USER，也可以为 BOT。
     */
    continue_last_message?: boolean | null;

    /**
     * 内容随机性
     */
    temperature?: number | null;

    /**
     * 生成文本的多样性
     */
    top_p?: number | null;

    /**
     * 最大生成token数，需要注意的是，这个参数并不会影响模型本身的生成效果，
     *
     * 而是仅仅通过以截断超出的 token 的方式来实现功能需要保证输入上文的 token 个数和这个值加一起小于 6144 或者 16384，否则请求会失败
     */
    tokens_to_generate?: number | null;

    /**
     * 对输出中易涉及隐私问题的文本信息进行脱敏，
     *
     * 目前包括但不限于邮箱、域名、链接、证件号、家庭住址等，默认 false，即开启脱敏
     */
    skip_info_mask?: boolean | null;

    /**
     * 对输出中易涉及隐私问题的文本信息进行打码，
     *
     * 目前包括但不限于邮箱、域名、链接、证件号、家庭住址等，默认true，即开启打码
     */
    mask_sensitive_info?: boolean | null;

    /**
     * 生成多少个结果；不设置默认为1，最大不超过4。
     *
     * 由于 beam_width 生成多个结果，会消耗更多 token。
     */
    beam_width?: number | null;

    /**
     * 是否以流式接口的形式返回数据，默认 false
     */
    stream?: boolean | null;

    /**
     * 是否使用标准 SSE 格式，设置为 true 时，
     * 流式返回的结果将以两个换行为分隔符。
     *
     * 只有在 stream=true 时，此参数才会生效。
     */
    use_standard_sse?: boolean | null;
  }

  export type ChatCompletionChoice = {
    index?: number;
    text: string;
    messages: {
      sender_type: 'BOT';
      sender_name: string;
      text: string;
    }[];
    finish_reason:
      | 'stop'
      | 'length'
      | 'tool_calls'
      | 'content_filter'
      | 'function_call';
  };

  export interface ChatCompletion {
    id: string;
    created: number;
    model: ChatModel;
    reply: string;
    choices: ChatCompletionChoice[];
    usage: {
      /**
       * Number of tokens in the generated completion.
       */
      completion_tokens: number;

      /**
       * Number of tokens in the prompt.
       */
      prompt_tokens: number;

      /**
       * Total number of tokens used in the request (prompt + completion).
       */
      total_tokens: number;
    };
    input_sensitive: boolean;
    output_sensitive: boolean;
    base_resp: {
      status_code: number;
      status_msg: string;
    };
  }

  export type ChatCompletionChunkChoice = {
    index: number;
    delta: string;
    messages: {
      sender_type: 'BOT';
      sender_name: string;
      text: string;
    }[];
    finish_reason:
      | 'stop'
      | 'length'
      | 'content_filter'
      | 'function_call'
      | null;
  };

  export interface ChatCompletionChunk {
    request_id: string;
    created: number;
    model: ChatModel;
    reply: string;
    choices: ChatCompletionChunkChoice[];
    usage: {
      total_tokens: number;
    };
    input_sensitive: false;
    output_sensitive: false;
    base_resp: {
      status_code: number;
      status_msg: string;
    };
  }
}
