import OpenAI, { APIError, OpenAIError } from 'openai';
import { type RequestOptions } from 'openai/core';

import { APIResource } from '../../resource';

export class Embeddings extends APIResource {
  protected endpoints: Record<EmbeddingModel, string> = {
    'ernie-text-embedding': '/embeddings/embedding-v1',
  };

  /**
   * Creates an embedding vector representing the input text.
   *
   * See https://cloud.baidu.com/doc/WENXINWORKSHOP/s/alj562vvu
   */
  async create(
    params: EmbeddingCreateParams,
    options?: RequestOptions,
  ): Promise<OpenAI.CreateEmbeddingResponse> {
    const { model, user, input } = params;
    const endpoint = this.endpoints[model];

    if (!endpoint) {
      throw new OpenAIError(`Invalid model: ${model}`);
    }

    const body = {
      input,
      user_id: user,
    };

    const response: Response = await this._client.post(endpoint, {
      body,
      ...options,
      __binaryResponse: true,
    });

    return Embeddings.fromResponse(model, await response.json());
  }

  static fromResponse(
    model: EmbeddingModel,
    data: CreateEmbeddingResponse,
  ): OpenAI.CreateEmbeddingResponse {
    Embeddings.assert(data);

    const { result } = data;

    return {
      data: result.data,
      model,
      object: 'list',
      usage: result.usage,
    };
  }

  /**
   * 如果 code 不为 0，抛出 APIError
   *
   * @param code -
   * @param message -
   */
  static assert(resp: CreateEmbeddingResponse) {
    if (resp.errorCode === 0) return;

    const error = { code: resp.errorCode, message: resp.errorMsg };

    throw APIError.generate(undefined, error, undefined, undefined);
  }
}

export type EmbeddingModel = 'ernie-text-embedding';

export interface EmbeddingCreateParams {
  /**
   * 输入文本
   */
  input: string | Array<string> | Array<number> | Array<Array<number>>;

  /**
   * 模型
   */
  model: EmbeddingModel;

  /**
   * 用户 ID
   */
  user?: string;
}

type CreateEmbeddingResponse = {
  errorCode: number;
  errorMsg: string;
  result: OpenAI.CreateEmbeddingResponse;
};
