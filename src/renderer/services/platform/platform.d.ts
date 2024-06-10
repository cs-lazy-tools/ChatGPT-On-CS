import { PlatformTypeEnum } from './constant';

export interface App {
  id: string;
  name: string;
  env: string;
  type?: PlatformTypeEnum;
  avatar?: string;
  desc?: string;
}

export interface Instance {
  task_id: string;
  app_id: string;
  env_id: string;
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

export interface GenericConfig {
  appId: string;
  instanceId: string;
  extractPhone: boolean;
  extractProduct: boolean;
  savePath: string;
  replySpeed: number;
  replyRandomSpeed: number;
  contextCount: number;
  waitHumansTime: number;
  defaultReply: string;
}

export interface LLMConfig {
  appId: string;
  instanceId: string;
  baseUrl: string;
  key: string;
  llmType: string;
  model: string;
}

export interface AccountConfig {
  activationCode: string;
}

export interface PluginConfig {
  appId: string;
  instanceId: string;
  usePlugin: boolean;
  pluginCode: string;
}
