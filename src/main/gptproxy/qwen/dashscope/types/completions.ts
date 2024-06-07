export namespace DashscopeCompletions {
  /**
   * https://help.aliyun.com/zh/dashscope/developer-reference/model-square
   */
  export type CompletionModel =
    // 通义千问
    | 'qwen-long'
    | 'qwen-turbo'
    | 'qwen-plus'
    | 'qwen-max'
    | 'qwen-max-0428'
    | 'qwen-max-0403'
    | 'qwen-max-0107'
    | 'qwen-max-1201'
    | 'qwen-max-longcontext'
    // 通义千问开源系列
    | 'qwen-7b-chat'
    | 'qwen-14b-chat'
    | 'qwen-72b-chat'
    // 多模型
    | 'qwen-vl-v1'
    | 'qwen-vl-chat-v1'
    | 'qwen-vl-plus'
    // LLAMA2;
    | 'llama2-7b-chat-v2'
    | 'llama2-13b-chat-v2'
    // 百川
    | 'baichuan-7b-v1'
    | 'baichuan2-13b-chat-v1'
    | 'baichuan2-7b-chat-v1'
    // ChatGLM
    | 'chatglm3-6b'
    | 'chatglm-6b-v2';

  export type ResponseFinish = 'stop' | 'length' | 'null';

  /**
   * - text 旧版本的 text
   * - message 兼容 openai 的 message
   *
   * @defaultValue "text"
   */
  export type ResponseFormat = 'text' | 'message';

  export type CompletionParametersParam = {
    /**
     * 启用流式输出
     *
     * 默认每次输出为当前生成的整个序列，最后一次输出为最终全部生成结果
     *
     * 通过 {@link CompletionParametersParam.incremental_output incremental_output} 参数关闭。
     */
    stream?: boolean | null;

    /**
     * 启用增量输出
     *
     * 启用 {@link ChatCompletionCreateParamsBase.stream stream} 参数时，每次输出是否每次都包含前面输出的内容。
     *
     * Warning: Function call 信息暂时不支持增量输出，开启时需要注意。
     *
     * @defaultValue false
     */
    incremental_output?: boolean | null;

    /**
     * 生成结果的格式
     *
     * @defaultValue "text"
     */
    result_format?: ResponseFormat;

    /**
     * 生成时，随机数的种子，用于控制模型生成的随机性。
     *
     * 如果使用相同的种子，每次运行生成的结果都将相同；
     * 当需要复现模型的生成结果时，可以使用相同的种子。
     * seed参数支持无符号64位整数类型。
     *
     * @defaultValue 1234
     */
    seed?: number | null;

    /**
     * 用于限制模型生成token的数量，max_tokens设置的是生成上限，并不表示一定会生成这么多的token数量。最大值和默认值均为1500
     *
     * @defaultValue 1500
     */
    max_tokens?: number | null;

    /**
     * 生成文本的多样性
     *
     * @defaultValue 0.8
     */
    top_p?: number | null;

    /**
     * 生成时，采样候选集的大小。
     *
     * 例如，
     * 取值为50时，仅将单次生成中得分最高的50个token组成随机采样的候选集。
     * 取值越大，生成的随机性越高；取值越小，生成的确定性越高。
     *
     * 注意：如果top_k参数为空或者top_k的值大于100，表示不启用top_k策略，此时仅有top_p策略生效，默认是空。
     *
     * @defaultValue 80
     */
    top_k?: number | null;

    /**
     * 用于控制模型生成时的重复度。提高repetition_penalty时可以降低模型生成的重复度。1.0表示不做惩罚。默认为1.1。
     */
    repetition_penalty?: number | null;

    /**
     * 用户控制模型生成时整个序列中的重复度。
     *
     * 提高时可以降低模型生成的重复度，取值范围[-2.0, 2.0]。
     */
    presence_penalty?: number | null;

    /**
     * 内容随机性
     *
     * @defaultValue 1.0
     */
    temperature?: number | null;

    /**
     * 生成停止标识符
     */
    stop?: string | string[] | null;

    /**
     * 生成时，是否参考搜索的结果。
     *
     * 注意：打开搜索并不意味着一定会使用搜索结果；
     * 如果打开搜索，模型会将搜索结果作为prompt，进而“自行判断”是否生成结合搜索结果的文本，默认为false
     */
    enable_search?: boolean | null;
  };

  export interface CompletionCreateParams {
    model: ({} & string) | CompletionModel;
    input: {
      prompt: string;
    };
    parameters?: DashscopeCompletions.CompletionParametersParam;
  }

  export interface CompletionUsage {
    output_tokens: number;
    input_tokens: number;
    total_tokens: number;
  }

  export namespace Completion {
    export interface Output {
      text: string;
      finish_reason: DashscopeCompletions.ResponseFinish;
    }
  }

  export interface Completion {
    request_id: string;
    usage: CompletionUsage;
    output: Completion.Output;
  }
}
