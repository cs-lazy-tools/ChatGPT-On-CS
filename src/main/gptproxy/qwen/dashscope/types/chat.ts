import type OpenAI from 'openai';

import type { DashscopeCompletions } from './completions';

export namespace DashscopeChat {
  /**
   * https://help.aliyun.com/zh/dashscope/developer-reference/model-square
   */
  export type ChatModel = DashscopeCompletions.CompletionModel;

  export type ResponseFinish =
    | 'stop'
    | 'length'
    | 'tool_calls'
    | 'content_filter'
    | 'function_call'
    | 'null';

  export interface ChatCompletionParametersParam
    extends DashscopeCompletions.CompletionParametersParam {
    /**
     * 指定可供模型调用的工具列表
     *
     * 当输入多个工具时，模型会选择其中一个生成结果。
     *
     * 警告：
     *
     * - tools 暂时无法和 incremental_output 参数同时使用
     * - 使用 tools 时需要同时指定 result_format 为 message
     */
    tools?: OpenAI.ChatCompletionTool[];
  }

  export interface ChatCompletionCreateParams {
    model: ({} & string) | ChatModel;
    input: {
      messages: OpenAI.ChatCompletionMessageParam[];
    };
    parameters?: ChatCompletionParametersParam;
  }

  export namespace ChatCompletion {
    export interface Output {
      text: string;
      finish_reason?: ResponseFinish;
      choices: OpenAI.ChatCompletion.Choice[];
    }
  }

  /**
   * 详见 [输入参数配置](https://help.aliyun.com/zh/dashscope/developer-reference/api-details)
   */
  export interface ChatCompletion {
    request_id: string;
    usage: DashscopeCompletions.CompletionUsage;
    output: ChatCompletion.Output;
  }
}
