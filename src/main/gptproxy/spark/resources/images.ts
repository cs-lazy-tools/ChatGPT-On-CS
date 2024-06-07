import OpenAI, { APIError } from 'openai';
import { type RequestOptions } from 'openai/core';

import { APIResource } from '../resource';

// TODO: 没有权限，暂未测试
export class Images extends APIResource {
  /**
   * See https://www.xfyun.cn/doc/spark/ImageGeneration.html
   */
  async generate(
    params: OpenAI.ImageGenerateParams,
    options?: RequestOptions,
  ): Promise<OpenAI.ImagesResponse> {
    const { prompt, user } = params;

    const body: ImagesAPI.ImageGenerateParams = {
      header: {
        app_id: this._client.appId,
        uid: user,
      },
      parameter: {
        chat: {
          max_tokens: 4096,
          domain: 'general',
          temperature: 0.5,
        },
      },
      payload: {
        message: {
          text: [{ role: 'user', content: prompt }],
        },
      },
    };

    const url = this._client.generateAuthorizationURL(
      'https://spark-api.cn-huabei-1.xf-yun.com/v2.1/tti',
      'POST',
    );

    const response: Response = await this._client.post(url, {
      ...options,
      body,
      __binaryResponse: true,
    });

    const resp: ImagesAPI.ImageGenerateResponse = await response.json();

    if (resp.header.code > 0) {
      throw new APIError(undefined, resp.header, undefined, undefined);
    }

    return {
      created: Date.now() / 1000,
      data: [
        {
          // base64 encoded image
          url: resp.payload.choices.text[0].content,
        },
      ],
    };
  }
}

namespace ImagesAPI {
  export type ImageGenerateMessageParam = {
    role: 'user';
    content: string;
  };

  export type ImageGenerateParams = {
    header: {
      /**
       * 应用ID
       */
      app_id: string;
      /**
       * 用户唯一标识
       */
      uid?: string;
    };
    parameter: {
      chat: {
        max_tokens: number;
        domain: string;
        temperature: number;
      };
    };
    payload: {
      message: {
        text: ImageGenerateMessageParam[];
      };
    };
  };

  type ImageGenerateAssistantMessage = {
    index: 0;
    role: 'assistant';
    content: string;
  };

  export type ImageGenerateResponse = {
    header: {
      code: number;
      message: string;
      sid: string;
      status: number;
    };
    payload: {
      choices: {
        status: number;
        seq: number;
        text: ImageGenerateAssistantMessage[];
      };
    };
  };
}
