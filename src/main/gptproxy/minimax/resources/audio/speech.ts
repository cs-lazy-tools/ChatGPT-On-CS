import { OpenAIError } from 'openai';
import { type RequestOptions } from 'openai/core';

import { APIResource } from '../../../resource';
import { assertStatusCode, type MinimaxAPIResponse } from '../../error';

export class Speech extends APIResource {
  protected resources: Record<
    SpeechModel,
    {
      model: string;
      endpoint: string;
      resposne_type: 'json' | 'binary' | 'stream';
    }
  > = {
    'speech-01': {
      model: 'speech-01',
      endpoint: '/text_to_speech',
      resposne_type: 'binary',
    },
    'speech-01-pro': {
      model: 'speech-01',
      endpoint: '/t2a_pro',
      resposne_type: 'json',
    },
    // Note: 返回的是 SSE 流数据
    // 'speech-01-stream': {
    //   model: 'speech-01',
    //   endpoint: '/tts/stream',
    //   resposne_type: 'stream',
    // },
  };

  /**
   * Generates audio from the input text.
   *
   * See https://api.minimax.chat/document/guides/T2A-model/tts
   */
  create(
    params: Speech.SpeechCreateParams,
    options?: RequestOptions,
  ): Promise<Response>;

  create(
    params: Speech.SpeechCreateParams,
    options: RequestOptions & {
      __binaryResponse: false;
    },
  ): Promise<Speech.AudioCreateResponse>;

  async create(
    params: Speech.SpeechCreateParams,
    options?: RequestOptions,
  ): Promise<Response | Speech.AudioCreateResponse> {
    const { input, voice, ...rest } = params;

    const resource = this.resources[params.model];
    if (!resource) {
      throw new OpenAIError(`Invalid model: ${params.model}`);
    }

    const body: Record<string, any> = {
      ...rest,
      text: input,
      model: resource.model,
    };

    if (voice) {
      body.voice_id = voice;
    }

    const response: Response = await this._client.post(resource.endpoint, {
      ...options,
      body,
      __binaryResponse: true,
    });

    // Note: pro 模型返回 json
    if (
      options?.__binaryResponse ||
      resource.resposne_type === 'binary' ||
      resource.resposne_type === 'stream'
    )
      return response;

    return response.json().then((data: Speech.AudioCreateResponse) => {
      assertStatusCode(data);

      return fetch(data.audio_file);
    });
  }
}

export type SpeechModel = Speech.SpeechModel;

export type SpeechCreateParams = Speech.SpeechCreateParams;

// eslint-disable-next-line no-redeclare
export namespace Speech {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export type SpeechModel =
    | (string & NonNullable<unknown>)
    | 'speech-01'
    | 'speech-01-pro';

  // eslint-disable-next-line @typescript-eslint/no-shadow
  export interface SpeechCreateParams {
    /**
     * One of the available [TTS models](https://api.minimax.chat/document/guides/T2A-model/tts)
     */
    model: SpeechModel;

    /**
     * The text to generate audio for.
     */
    input: string;

    /**
     * The voice to use when generating the audio.
     *
     * - 青涩青年音色(male-qn-qingse)
     * - 精英青年音色(male-qn-jingying)
     * - 霸道青年音色(male-qn-badao)
     * - 青年大学生音色(male-qn-daxuesheng)
     * - 少女音色(female-shaonv)
     * - 御姐音色(female-yujie)
     * - 成熟女性音色(female-chengshu)
     * - 甜美女性音色(female-tianmei)
     * - 男性主持人(presenter_male)
     * - 女性主持人(presenter_female)
     * - 男性有声书1(audiobook_male_1)
     * - 男性有声书2(audiobook_male_2)
     * - 女性有声书1(audiobook_female_1)
     * - 女性有声书2(audiobook_female_2)
     * - 青涩青年音色-beta(male-qn-qingse-jingpin)
     * - 精英青年音色-beta(male-qn-jingying-jingpin)
     * - 霸道青年音色-beta(male-qn-badao-jingpin)
     * - 青年大学生音色-beta(male-qn-daxuesheng-jingpin)
     * - 少女音色-beta(female-shaonv-jingpin)
     * - 御姐音色-beta(female-yujie-jingpin)
     * - 成熟女性音色-beta(female-chengshu-jingpin)
     * - 甜美女性音色-beta(female-tianmei-jingpin)
     */
    voice:
      | (string & NonNullable<unknown>)
      | 'male-qn-qingse'
      | 'male-qn-jingying'
      | 'male-qn-badao'
      | 'male-qn-daxuesheng'
      | 'female-shaonv'
      | 'female-yujie'
      | 'female-chengshu'
      | 'female-tianmei'
      | 'presenter_male'
      | 'presenter_female'
      | 'audiobook_male_1'
      | 'audiobook_male_2'
      | 'audiobook_female_1'
      | 'audiobook_female_2'
      | 'male-qn-qingse-jingpin'
      | 'male-qn-jingying-jingpin'
      | 'male-qn-badao-jingpin'
      | 'male-qn-daxuesheng-jingpin'
      | 'female-shaonv-jingpin'
      | 'female-yujie-jingpin'
      | 'female-chengshu-jingpin'
      | 'female-tianmei-jingpin';

    /**
     * The speed of the generated audio.
     *
     * Range: 0.5 - 2.0
     *
     * @defaultValue 1.0
     */
    speed?: number;

    /**
     * The vol of the generated audio.
     *
     *
     * Range: 0~1
     *
     * @defaultValue 1.0
     */
    vol?: number;

    /**
     * The pitch of the generated audio.
     *
     * Range: 0~1
     *
     * @defaultValue 0
     */
    pitch?: number;

    /**
     * 生成声音的采样率。t2a_pro 可用
     *
     * Range: [16000, 24000]
     *
     * @defaultValue 24000
     */
    audio_sample_rate?: number;

    /**
     * 生成声音的比特率. t2a_pro 可用
     *
     * Range: [32000, 64000，128000]
     *
     * @defaultValue 128000
     */
    bitrate?: number;

    /**
     * The format to audio in. Supported formats are `mp3`, `opus`, `aac`, and `flac`.
     */
    response_format?: 'mp3' | 'opus' | 'aac' | 'flac';
  }

  export interface AudioCreateResponse extends MinimaxAPIResponse {
    audio_file: string;
    subtitle_file: string;
    trace_id: string;
    extra_info: {
      audio_length: number;
      audio_sample_rate: number;
      audio_size: number;
      bitrate: number;
      word_count: number;
      invisible_character_ratio: number;
    };
  }
}
