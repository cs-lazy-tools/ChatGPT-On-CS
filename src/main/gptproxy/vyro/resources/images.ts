import { ReadableStream } from 'node:stream/web';

import { type RequestOptions, type Uploadable } from 'openai/core';
import { toFile } from 'openai/uploads';

import { random } from '../../util';
import { APIResource } from '../resource';

export class Images extends APIResource {
  protected models: Record<ImageModel, number> = {
    'imagine-v5': 33,
    'anime-v5': 34,
    'imagine-v4.1': 32,
    'imagine-v4': 31,
    'imagine-v3': 30,
    'imagine-v1': 28,
    realistic: 29,
    anime: 21,
    portrait: 26,
    'sdxl-1.0': 122,
  };

  /**
   * Creates a variation of a given image.
   */
  async createVariation(
    params: ImageCreateVariationParams,
    options?: RequestOptions,
  ): Promise<ImagesResponse> {
    const client = this._client;

    const formData = new FormData();

    const { model, style = this.models[model ?? 'realistic'] } = params;

    // @ts-expect-error
    formData.append('image', await toFile(params.image));
    formData.append('style_id', (style || 29).toString());
    formData.append('prompt', params.prompt);
    formData.append('negative_prompt', params.negative_prompt || '');
    formData.append('strength', (params.strength || 0).toString());
    formData.append('steps', (params.steps || 30).toString());
    formData.append('cfg', (params.cfg || 7.5).toString());
    formData.append('seed', (params.seed || random(1, 1000000)).toString());

    const response: Response = await client.post(
      `/imagine/${client.apiType}/generations/variations`,
      {
        ...options,
        body: {
          body: formData,
          [Symbol.toStringTag]: 'MultipartBody',
        },
        __binaryResponse: true,
      },
    );

    return {
      data: [
        {
          binary: response.body as unknown as ReadableStream,
        },
      ],
      created: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Experience the magic of Imagine's Image Remix feature, designed to breathe new life into your existing images.
   */
  async edit(
    params: ImageEditParams,
    options?: RequestOptions,
  ): Promise<ImagesResponse> {
    const client = this._client;

    const formData = new FormData();

    const { model, style = this.models[model ?? 'realistic'] } = params;

    // @ts-expect-error
    formData.append('image', await toFile(params.image));
    formData.append('style_id', (style || 29).toString());
    formData.append('prompt', params.prompt);
    formData.append('negative_prompt', params.negative_prompt || '');
    formData.append('strength', (params.strength || 0).toString());
    formData.append('control', params.control || 'openpose');
    formData.append('steps', (params.steps || 30).toString());
    formData.append('cfg', (params.cfg || 7.5).toString());
    formData.append('seed', (params.seed || random(1, 1000000)).toString());

    const response: Response = await client.post(
      `/imagine/${client.apiType}/edits/remix`,
      {
        ...options,
        body: {
          body: formData,
          [Symbol.toStringTag]: 'MultipartBody',
        },
        __binaryResponse: true,
      },
    );

    return {
      data: [
        {
          binary: response.body as unknown as ReadableStream,
        },
      ],
      created: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Creates an image given a prompt.
   */
  async generate(
    params: ImageGenerateParams,
    options?: RequestOptions,
  ): Promise<ImagesResponse> {
    const client = this._client;

    const formData = new FormData();

    const { model, style = this.models[model ?? 'imagine-v4'] } = params;

    formData.append('style_id', (style || 30).toString());
    formData.append('prompt', params.prompt);
    formData.append('negative_prompt', params.negative_prompt || '');
    formData.append('aspect_ratio', params.aspect_ratio || '1:1');
    formData.append('steps', (params.steps || 30).toString());
    formData.append('cfg', (params.cfg || 7.5).toString());
    formData.append('seed', (params.seed || random(1, 1000000)).toString());
    formData.append('high_res_results', params.quality === 'hd' ? '1' : '0');

    const response: Response = await client.post(
      `/imagine/${client.apiType}/generations`,
      {
        ...options,
        body: {
          body: formData,
          [Symbol.toStringTag]: 'MultipartBody',
        },
        __binaryResponse: true,
      },
    );

    return {
      created: Math.floor(Date.now() / 1000),
      data: [
        {
          binary: response.body as unknown as ReadableStream,
        },
      ],
    };
  }

  /**
   * The image upscale feature provides a better image to the user by increasing its resolution.
   */
  async upscale(
    params: ImageUpscaleParams,
    options?: RequestOptions,
  ): Promise<ImagesResponse> {
    const client = this._client;

    const formData = new FormData();

    // @ts-expect-error
    formData.append('image', await toFile(params.image));

    const response: Response = await client.post(
      `/imagine/${client.apiType}/upscale`,
      {
        ...options,
        body: {
          body: formData,
          [Symbol.toStringTag]: 'MultipartBody',
        },
        __binaryResponse: true,
      },
    );

    return {
      created: Math.floor(Date.now() / 1000),
      data: [
        {
          binary: response.body as unknown as ReadableStream,
        },
      ],
    };
  }

  /**
   * Inpaint is an advanced feature of the Text-to-Image Stable Diffusion pipeline.
   * It allows users to remove unwanted objects or elements from an image by intelligently filling in the missing areas.
   */
  async restoration(
    params: ImageRestorationParams,
    options?: RequestOptions,
  ): Promise<ImagesResponse> {
    const client = this._client;

    const formData = new FormData();

    // @ts-expect-error
    formData.append('image', await toFile(params.image));
    // @ts-expect-error
    formData.append('mask', await toFile(params.mask));
    formData.append('style_id', '1');
    formData.append('prompt', params.prompt);
    formData.append('neg_prompt', params.negative_prompt || '');
    formData.append('inpaint_strength', (params.strength || 0).toString());
    formData.append('cfg', (params.cfg || 7.5).toString());

    const response: Response = await client.post(
      `/imagine/${client.apiType}/generations/variations`,
      {
        ...options,
        body: {
          body: formData,
          [Symbol.toStringTag]: 'MultipartBody',
        },
        __binaryResponse: true,
      },
    );

    return {
      data: [
        {
          binary: response.body as unknown as ReadableStream,
        },
      ],
      created: Math.floor(Date.now() / 1000),
    };
  }
}

export type ImageModel =
  | 'imagine-v5'
  | 'anime-v5'
  | 'imagine-v4.1'
  | 'imagine-v4'
  | 'imagine-v3'
  | 'imagine-v1'
  | 'realistic'
  | 'anime'
  | 'portrait'
  | 'sdxl-1.0';

export interface ImageRestorationParams {
  /**
   * The image to use as the basis for the variation(s). Must be a valid PNG file,
   * less than 4MB, and square.
   */
  image: Uploadable;

  /**
   * The mask indicating the areas to be inpainted.
   */
  mask: Uploadable;

  /**
   * The text guides the image generation.
   */
  prompt: string;

  /**
   * The model to use for image generation.
   */
  model?: 'vyro-inpaint' | null;

  /**
   * The negative_prompt parameter empowers you to provide additional
   * guidance to the AI by specifying what you don't want in the image.
   * It helps refine the creative direction, ensuring that the generated
   * content aligns with your intentions.
   */
  negative_prompt?: string | null;

  /**
   * Specifies the model to be used. Currently supports only 1 for realism.
   *
   * @defaultValue 1
   */
  style?: 1 | null;

  /**
   * Weightage to be given to text
   *
   * Range: 3 - 15
   *
   * @defaultValue 7.5
   */
  cfg?: number | null;

  /**
   * Weightage given to initial image. Greater this parameter more the output will be close to starting image and far from prompt.
   *
   * Range: 0 - 1
   *
   * @defaultValue 0.5
   */
  strength?: number | null;

  /**
   * 目前仅支持 binary 格式
   */
  response_format?: 'binary' | null;
}

export interface ImageCreateVariationParams {
  /**
   * The image to use as the basis for the variation(s). Must be a valid PNG file,
   * less than 4MB, and square.
   */
  image: Uploadable;

  /**
   * The text guides the image generation.
   */
  prompt: string;

  /**
   * The model to use for image generation.
   */
  model?: ImageModel | null;

  /**
   * The negative_prompt parameter empowers you to provide additional
   * guidance to the AI by specifying what you don't want in the image.
   * It helps refine the creative direction, ensuring that the generated
   * content aligns with your intentions.
   */
  negative_prompt?: string | null;

  /**
   * The style_id parameter is like choosing an artistic palette for your image.
   * By selecting a style id, you guide the AI in crafting the image with a particular visual aesthetic.
   * Style IDs range from 1 to N, each representing a unique artistic style.
   *
   * @defaultValue 30
   */
  style?: number | null;

  /**
   * The steps parameter defines the number of operations or iterations that the
   * generator will perform during image creation. It can impact the complexity
   * and detail of the generated image.
   *
   * Range: 30-50
   *
   * @defaultValue 30
   */
  steps?: number | null;

  /**
   * The cfg parameter acts as a creative control knob.
   * You can adjust it to fine-tune the level of artistic innovation in the image.
   * Lower values encourage faithful execution of the prompt,
   * while higher values introduce more creative and imaginative variations.
   *
   * Range: 3 - 15
   *
   * @defaultValue 7.5
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
   * Influences the impact of the control image on output.
   *
   * Range: 0 - 1
   *
   * @defaultValue 0
   */
  strength?: number | null;

  /**
   * 目前仅支持 binary 格式
   */
  response_format?: 'binary' | null;
}

export interface ImageEditParams {
  /**
   * The image to use as the basis for the variation(s). Must be a valid PNG file,
   * less than 4MB, and square.
   */
  image: Uploadable;

  /**
   * The text guides the image generation.
   */
  prompt: string;

  /**
   * The model to use for image generation.
   */
  model?: ImageModel | null;

  /**
   * The negative_prompt parameter empowers you to provide additional
   * guidance to the AI by specifying what you don't want in the image.
   * It helps refine the creative direction, ensuring that the generated
   * content aligns with your intentions.
   */
  negative_prompt?: string | null;

  /**
   * The style_id parameter is like choosing an artistic palette for your image.
   * By selecting a style id, you guide the AI in crafting the image with a particular visual aesthetic.
   * Style IDs range from 1 to N, each representing a unique artistic style.
   *
   * @defaultValue 29
   */
  style?: number | null;

  /**
   * The steps parameter defines the number of operations or iterations that the
   * generator will perform during image creation. It can impact the complexity
   * and detail of the generated image.
   *
   * Range: 30-50
   *
   * @defaultValue 30
   */
  steps?: number | null;

  /**
   * The cfg parameter acts as a creative control knob.
   * You can adjust it to fine-tune the level of artistic innovation in the image.
   * Lower values encourage faithful execution of the prompt,
   * while higher values introduce more creative and imaginative variations.
   *
   * Range: 3 - 15
   *
   * @defaultValue 7.5
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
   * Influences the impact of the control image on output.
   *
   * Range: 0 - 1
   *
   * @defaultValue 0
   */
  strength?: number | null;

  /**
   * The method/control used to guide image generation.
   *
   * @defaultValue openpose
   */
  control?: 'openpose' | 'scribble' | 'canny' | 'lineart' | 'depth' | null;

  /**
   * 目前仅支持 binary 格式
   */
  response_format?: 'binary' | null;
}

export interface ImageGenerateParams {
  /**
   * A prompt is the text input that guides the AI in generating visual content.
   * It defines the textual description or concept for the image you wish to generate.
   * Think of it as the creative vision you want the AI to bring to life.
   * Crafting clear and creative prompts is crucial for achieving the desired results with Imagine's API.
   * For example, A serene forest with a river under the moonlight, can be a prompt.
   */
  prompt: string;

  /**
   * The model to use for image generation.
   */
  model?: ImageModel | null;

  /**
   * The negative_prompt parameter empowers you to provide additional
   * guidance to the AI by specifying what you don't want in the image.
   * It helps refine the creative direction, ensuring that the generated
   * content aligns with your intentions.
   */
  negative_prompt?: string | null;

  /**
   * The aspect_ratio parameter allows you to specify the proportions and dimensions of the generated image.
   * You can set it to different ratios like 1:1 for square images, 16:9 for widescreen, or 3:4 for vertical formats,
   * shaping the visual composition to your liking.
   *
   * @defaultValue 1:1
   */
  aspect_ratio?: '1:1' | '3:2' | '4:3' | '3:4' | '16:9' | '9:16' | null;

  /**
   * The quality parameter is a flag that, when set to hd,
   * requests high-resolution results from the AI.
   *
   * @defaultValue standard
   */
  quality?: 'standard' | 'hd';

  /**
   * The style_id parameter is like choosing an artistic palette for your image.
   * By selecting a style id, you guide the AI in crafting the image with a particular visual aesthetic.
   * Style IDs range from 1 to N, each representing a unique artistic style.
   *
   * @defaultValue 30
   */
  style?: number | null;

  /**
   * The steps parameter defines the number of operations or iterations that the
   * generator will perform during image creation. It can impact the complexity
   * and detail of the generated image.
   *
   * Range: 30-50
   *
   * @defaultValue 30
   */
  steps?: number | null;

  /**
   * The cfg parameter acts as a creative control knob.
   * You can adjust it to fine-tune the level of artistic innovation in the image.
   * Lower values encourage faithful execution of the prompt,
   * while higher values introduce more creative and imaginative variations.
   *
   * Range: 3 - 15
   *
   * @defaultValue 7.5
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
   * 目前仅支持 binary 格式
   */
  response_format?: 'binary' | null;
}

export interface ImageUpscaleParams {
  /**
   * The image to use as the basis for the variation(s). Must be a valid PNG file,
   * less than 4MB, and square.
   */
  image: Uploadable;
}

export interface Image {
  /**
   * The binary of the generated image.
   */
  binary?: ReadableStream;

  /**
   * The base64-encoded JSON of the generated image, if `response_format` is
   * `b64_json`.
   */
  b64_json?: string;

  /**
   * The prompt that was used to generate the image, if there was any revision to the
   * prompt.
   */
  revised_prompt?: string;

  /**
   * The URL of the generated image, if `response_format` is `url` (default).
   */
  url?: string;
}

export interface ImagesResponse {
  /**
   * When the request was made.
   */
  created: number;

  /**
   * The generated images.
   */
  data: Image[];
}
