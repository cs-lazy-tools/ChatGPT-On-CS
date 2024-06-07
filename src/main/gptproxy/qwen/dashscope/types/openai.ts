import type OpenAI from 'openai';

import type { DashscopeChat } from './chat';
import type { DashscopeCompletions } from './completions';
import { DashscopeEmbeddings } from './embeddings';

export namespace OpenAICompletionsCompatibility {
  export type CompletionModel = DashscopeCompletions.CompletionModel;

  export interface StreamOptions {
    /**
     * 启用增量输出
     *
     * 在启用流输出参数后，是否每次输出是否每次都包含前面输出的内容。
     *
     * @defaultValue true
     */
    incremental_output?: boolean | null;
  }

  export interface CompletionCreateParamsBase
    extends Pick<
      DashscopeCompletions.CompletionParametersParam,
      | 'enable_search'
      | 'temperature'
      | 'presence_penalty'
      | 'repetition_penalty'
      | 'top_k'
      | 'top_p'
      | 'seed'
      | 'stop'
      | 'max_tokens'
      | 'stream'
    > {
    /**
     * 生成模型
     *
     * 内置的 {@link CompletionModel} 是经过测试的，但你可以通过 [模型列表](https://help.aliyun.com/zh/dashscope/developer-reference/model-square) 测试其他支持的模型。
     */
    model: ({} & string) | CompletionModel;

    /**
     * 用户输入的指令，用于指导模型生成回复
     */
    prompt: string;

    /**
     * 流输出额外参数
     */
    stream_options?: StreamOptions | null;

    /**
     * 响应格式
     */
    response_format?: {
      type?: 'text';
    };
  }

  export interface CompletionCreateParamsNonStreaming
    extends CompletionCreateParamsBase {
    /**
     * 启用流式输出
     *
     * 默认每次输出为当前生成的整个序列，最后一次输出为最终全部生成结果
     * 可以使用 {@link StreamOptions stream_options} 参数关闭。
     */
    stream?: false | null;
  }

  export interface CompletionCreateParamsStreaming
    extends CompletionCreateParamsBase {
    /**
     * 启用流式输出
     *
     * 默认每次输出为当前生成的整个序列，最后一次输出为最终全部生成结果
     * 可以使用 {@link StreamOptions stream_options} 参数关闭。
     */
    stream: true;
  }

  export type CompletionCreateParams =
    | CompletionCreateParamsNonStreaming
    | CompletionCreateParamsStreaming;
}

export namespace OpenAIChatCompatibility {
  export type ChatModel = DashscopeChat.ChatModel;

  export interface ChatCompletionCreateParamsBase
    extends Pick<
      DashscopeCompletions.CompletionParametersParam,
      | 'enable_search'
      | 'temperature'
      | 'presence_penalty'
      | 'repetition_penalty'
      | 'top_k'
      | 'top_p'
      | 'seed'
      | 'stop'
      | 'max_tokens'
      | 'stream'
    > {
    /**
     * 聊天模型
     *
     * 内置的 {@link ChatModel} 是经过测试的，但你可以通过 [模型列表](https://help.aliyun.com/zh/dashscope/developer-reference/model-square) 测试其他支持的模型。
     */
    model: ({} & string) | ChatModel;

    /**
     * 聊天上下文信息
     */
    messages: OpenAI.ChatCompletionMessageParam[];

    /**
     * 指定可供模型调用的工具列表
     *
     * 当输入多个工具时，模型会选择其中一个生成结果。
     */
    tools?: OpenAI.ChatCompletionTool[];

    /**
     * SDK 内部有特殊的多模型消息适配机制
     *
     * 设置为 true 可以直接采用外部传递的消息格式
     */
    raw?: boolean | null;

    /**
     * 流输出额外参数
     */
    stream_options?: OpenAICompletionsCompatibility.StreamOptions | null;

    /**
     * 响应格式
     */
    response_format?: {
      type?: 'text';
    };
  }

  export interface ChatCompletionCreateParamsNonStreaming
    extends ChatCompletionCreateParamsBase {
    /**
     * 启用流式输出
     *
     * 默认每次输出为当前生成的整个序列，最后一次输出为最终全部生成结果
     * 可以使用 {@link ChatCompletionCreateParamsBase.stream_options stream_options} 参数关闭。
     */
    stream?: false | null;
  }

  export interface ChatCompletionCreateParamsStreaming
    extends ChatCompletionCreateParamsBase {
    /**
     * 启用流式输出
     *
     * 默认每次输出为当前生成的整个序列，最后一次输出为最终全部生成结果
     * 可以使用 {@link ChatCompletionCreateParamsBase.stream_options stream_options} 参数关闭。
     */
    stream: true;
  }

  export type ChatCompletionCreateParams =
    | ChatCompletionCreateParamsNonStreaming
    | ChatCompletionCreateParamsStreaming;
}

export namespace OpenAIEmbeddingsCompatibility {
  export interface EmbeddingCreateParams {
    /**
     * 模型
     */
    model: ({} & string) | DashscopeEmbeddings.EmbeddingModel;

    /**
     * 输入文本
     */
    input: string | Array<string> | Array<number> | Array<Array<number>>;

    /**
     * 文本转换为向量后可以应用于检索、聚类、分类等下游任务，对检索这类非对称任务为了达到更好的检索效果
     * 建议区分查询文本（query）和底库文本（document）类型,
     * 聚类、分类等对称任务可以不用特殊指定，采用系统默认值"document"即可
     *
     * @defaultValue 'query'
     */
    type?: 'query' | 'document';
  }
}
