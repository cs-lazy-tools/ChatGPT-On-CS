import OpenAI from 'openai';
import {
  type FinalRequestOptions,
  type PagePromise,
  type RequestOptions,
} from 'openai/core';
import { Page } from 'openai/pagination';

import { type GeminiAI } from '../../index';
import { APIResource } from '../resource';

// TODO 输出原始对象
export class Models extends APIResource {
  /**
   * Retrieves a model instance, providing basic information about the model such as
   * the owner and permissioning.
   */
  async retrieve(model: string, options?: RequestOptions): Promise<Model> {
    const item: GeminiModel = await this._client.get(
      `/models/${model}`,
      options,
    );

    return {
      id: item.name,
      created: 0,
      object: 'model',
      owned_by: 'google',
    };
  }

  /**
   * Lists the currently available models, and provides basic information about each
   * one such as the owner and availability.
   */
  list(options?: RequestOptions): PagePromise<ModelsPage, Model> {
    return this._client.getAPIList('/models', ModelsPage, options);
  }
}

export class ModelsPage extends Page<Model> {
  constructor(
    client: GeminiAI,
    response: Response,
    body: GeminiPageResponse,
    options: FinalRequestOptions,
  ) {
    const data: Model[] = body.models.map((item) => {
      return {
        id: item.name,
        created: 0,
        object: 'model',
        owned_by: 'google',
      };
    });

    // @ts-ignore
    super(client, response, { data, object: 'list' }, options);
  }
}

interface GeminiModel {
  name: string;
  version: string;
  displayName: string;
  description: string;
  inputTokenLimit: string;
  outputTokenLimit: string;
  supportedGenerationMethods: string[];
}

interface GeminiPageResponse {
  models: GeminiModel[];
}

/**
 * Describes an OpenAI model offering that can be used with the API.
 */
export type Model = OpenAI.Models.Model;

// eslint-disable-next-line no-redeclare
export namespace Models {
  export import Model = OpenAI.Models.Model;
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export import ModelsPage = OpenAI.Models.ModelsPage;
}
