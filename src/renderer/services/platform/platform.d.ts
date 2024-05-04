import { PlatformTypeEnum } from './constant';

export interface Platform {
  id: string;
  name: string;
  impl: boolean;
  type?: PlatformTypeEnum;
  urls?: string[];
  avatar?: string;
  desc?: string;
}

export interface PlatformSettings {
  platform_id: string;
  openai_url: string;
  api_key: string;
  prompt: string;
  active: boolean;
}

export interface Reply {
  id?: number;
  platform_id?: string;
  keyword: string;
  reply: string;
  mode?: 'fuzzy' | 'exact';
  ptf_name?: string;
}

export interface Message {
  id: number;
  username: string;
  session_id: number;
  role: string;
  created_at: string;
  content: string;
  msg_type: string;
  platform_id: string;
  platform: string;
  goods_avatar: string | null;
  goods_name: string | null;
}

export interface Config {
  extract_phone: boolean; // 提取手机号
  extract_product: boolean; // 提取商品
  save_path?: string; // 保存路径
  reply_speed: number[]; // 回复速度
  default_reply: string; // 默认回复
  context_count: number; // 合并消息数量
  wait_humans_time: number; // 等待人工时间

  gpt_base_url?: string; // GPT服务地址
  gpt_key?: string; // GPT服务key
  gpt_model?: string; // GPT服务模型
  gpt_temperature?: number; // GPT服务温度
  gpt_top_p?: number; // GPT服务top_p
  stream?: boolean; // 是否开启stream

  use_dify?: boolean; // 是否使用 Dify 百宝箱
}

export interface CustomerServiceSettingsForm {
  extractPhone: boolean;
  extractProduct: boolean;
  folderPath: string;
  replySpeed: number[];
  defaultReply: string;
  contextCount: number;
  manualInterventionInterval: number;
}

export interface GptSettingsForm {
  useDify: boolean;
  gptAddress: string;
  apiKey: string;
  model: string;
  temperature: number;
  topP: number;
  stream: boolean;
}
