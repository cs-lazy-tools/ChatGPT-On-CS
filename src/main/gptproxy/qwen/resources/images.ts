import OpenAI, { OpenAIError } from 'openai';
import { type RequestOptions } from 'openai/core';

import { APIResource } from '../../resource';

export class Images extends APIResource {
  /**
   * Creates an image given a prompt.
   */
  async generate(
    params: ImageGenerateParams,
    options: RequestOptions = {},
  ): Promise<OpenAI.ImagesResponse> {
    const client = this._client;

    const { headers, ...config } = options;
    const { model = 'wanx-v1', prompt, n = 1, cfg, ...rest } = params;

    const taskId = await client
      .post<any, Response>('/services/aigc/text2image/image-synthesis', {
        ...config,
        headers: { 'X-DashScope-Async': 'enable', ...headers },
        body: {
          model,
          input: {
            prompt,
          },
          parameters: {
            ...rest,
            scale: cfg,
            n,
          },
        },
        __binaryResponse: true,
      })
      .then<ImageCreateTaskResponse>((res) => res.json())
      .then((res) => res.output.task_id);

    return this.waitTask(taskId, options).then((images) => {
      return {
        created: Date.now() / 1000,
        data: images,
      };
    });
  }

  protected async waitTask(
    taskId: string,
    options?: RequestOptions,
  ): Promise<ImageTask.Image[]> {
    const response = await this._client
      .get<any, Response>(`/tasks/${taskId}`, {
        ...options,
        __binaryResponse: true,
      })
      // eslint-disable-next-line @typescript-eslint/no-shadow
      .then<ImageTaskQueryResponse>((response) => response.json());

    const { task_status, message } = response.output;

    if (task_status === 'PENDING' || task_status === 'RUNNING') {
      return new Promise<ImageTask.Image[]>((resolve) => {
        setTimeout(() => resolve(this.waitTask(taskId, options)), 5000);
      });
    }

    if (task_status === 'SUCCEEDED') {
      return response.output.results.filter(
        (result) => 'url' in result,
      ) as ImageTask.Image[];
    }

    if (task_status === 'FAILED') {
      throw new OpenAIError(message);
    }

    throw new OpenAIError('Unknown task status');
  }
}

type ImageCreateTaskResponse = {
  request_id: string;
  output: {
    task_id: string;
    task_status: ImageTask.Status;
    code: string;
    message: string;
  };
};

type ImageTaskQueryResponse =
  | ImageTaskPendingResponse
  | ImageTaskRunningResponse
  | ImageTaskFinishedResponse
  | ImageTaskFailedResponse
  | ImageTaskUnknownResponse;

type ImageTaskPendingResponse = {
  request_id: string;
  output: {
    task_id: string;
    task_status: 'PENDING';
    task_metrics: ImageTask.Metrics;
    submit_time: string;
    scheduled_time: string;
    code: string;
    message: string;
  };
};

type ImageTaskRunningResponse = {
  request_id: string;
  output: {
    task_id: string;
    task_status: 'RUNNING';
    task_metrics: ImageTask.Metrics;
    submit_time: string;
    scheduled_time: string;
    code: string;
    message: string;
  };
};

type ImageTaskFinishedResponse = {
  request_id: string;
  output: {
    task_id: string;
    task_status: 'SUCCEEDED';
    task_metrics: ImageTask.Metrics;
    results: (ImageTask.Image | ImageTask.FailedError)[];
    submit_time: string;
    scheduled_time: string;
    end_time: string;
    code: string;
    message: string;
  };
  usage: {
    image_count: number;
  };
};

type ImageTaskFailedResponse = {
  request_id: string;
  code: string;
  message: string;
  output: {
    task_status: 'FAILED';
    task_metrics: ImageTask.Metrics;
    submit_time: string;
    scheduled_time: string;
    code: string;
    message: string;
  };
};

type ImageTaskUnknownResponse = {
  request_id: string;
  output: {
    task_status: 'UNKNOWN';
    task_metrics: ImageTask.Metrics;
    code: string;
    message: string;
  };
};

namespace ImageTask {
  export type Image = {
    url: string;
  };

  export type FailedError = {
    code: string;
    message: string;
  };

  export type Status =
    | 'PENDING'
    | 'RUNNING'
    | 'SUCCEEDED'
    | 'FAILED'
    | 'UNKNOWN';

  export type Metrics = {
    TOTAL: number;
    SUCCEEDED: number;
    FAILED: number;
  };
}

export type ImageModel = Images.ImageModel;

export type ImageGenerateParams = Images.ImageGenerateParams;

// eslint-disable-next-line no-redeclare
export namespace Images {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export type ImageModel =
    | (string & NonNullable<unknown>)
    // 通义万相
    | 'wanx-v1'
    // Stable Diffusion
    | 'stable-diffusion-v1.5'
    | 'stable-diffusion-xl';

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export interface ImageGenerateParams {
    /**
     * The model to use for image generation.
     *
     * @defaultValue wanx-v1
     */
    model?: ImageModel | null;

    /**
     * A prompt is the text input that guides the AI in generating visual content.
     * It defines the textual description or concept for the image you wish to generate.
     * Think of it as the creative vision you want the AI to bring to life.
     * Crafting clear and creative prompts is crucial for achieving the desired results with Imagine's API.
     * For example, A serene forest with a river under the moonlight, can be a prompt.
     */
    prompt: string;

    /**
     * The negative_prompt parameter empowers you to provide additional
     * guidance to the AI by specifying what you don't want in the image.
     * It helps refine the creative direction, ensuring that the generated
     * content aligns with your intentions.
     */
    negative_prompt?: string | null;

    /**
     * The size of the generated images.
     *
     * @defaultValue 1024*1024
     */
    size?: (string & NonNullable<unknown>) | '1024*1024' | null;

    /**
     * The style of the generated images.
     *
     * - \<photography\> 摄影
     * - \<portrait\> 人像写真
     * - \<3d cartoon\> 3D卡通
     * - \<anime\> 动画
     * - \<oil painting\> 油画
     * - \<watercolor\>水彩
     * - \<sketch\> 素描
     * - \<chinese painting\> 中国画
     * - \<flat illustration\> 扁平插画
     * - \<auto\> 默认
     *
     * 仅 wanx-v1 模型支持
     *
     * @defaultValue <auto>
     */
    style?:
      | '<photography>'
      | '<portrait>'
      | '<3d cartoon>'
      | '<anime>'
      | '<oil painting>'
      | '<watercolor>'
      | '<sketch>'
      | '<chinese painting>'
      | '<flat illustration>'
      | '<auto>'
      | null;

    /**
     * The number of images to generate. Must be between 1 and 4.
     *
     * @defaultValue 1
     */
    n?: number | null;

    /**
     * The steps parameter defines the number of operations or iterations that the
     * generator will perform during image creation. It can impact the complexity
     * and detail of the generated image.
     *
     * Range: 30-50
     *
     * 仅 StableDiffusion 模型支持
     *
     * @defaultValue 40
     */
    steps?: number | null;

    /**
     * The cfg parameter acts as a creative control knob.
     * You can adjust it to fine-tune the level of artistic innovation in the image.
     * Lower values encourage faithful execution of the prompt,
     * while higher values introduce more creative and imaginative variations.
     *
     * Range: 1 - 15
     *
     * @defaultValue 10
     */
    cfg?: number | null;

    /**
     * The seed parameter serves as the initial value for the random number generator.
     * By setting a specific seed value, you can ensure that the AI generates the same
     * image or outcome each time you use that exact seed.
     *
     * range: 1-Infinity
     */
    seed?: number | null;

    /**
     * The format in which the generated images are returned.
     */
    response_format?: 'url' | null;
  }
}
