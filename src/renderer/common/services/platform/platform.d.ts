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

export type RoleType = 'SELF' | 'OTHER' | 'SYSTEM';
export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'NO_REPLY';

export interface Reply {
  content: string;
  type: MessageType;
}

export interface Message {
  sender: string;
  content: string;
  role: RoleType; // assistant, user
  type: MessageType;
}

export interface LogBody {
  level: string;
  time: string;
  message: string;
}

export interface LogObj {
  time: string;
  content: string;
}

export interface Plugin {
  id?: number;
  code?: string;
  type?: string;
  title?: string;
  author?: string;
  description?: string;
  tags?: string[];
  icon?: string;
  source?: string; // custom, third-party
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
  truncateWordCount: number;
  truncateWordKey: string;
  jinritemaiDefaultReplyMatch: string;
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
  pluginId: number;
}

export interface DriverConfig {
  hasPaused: boolean;
  hasKeywordMatch: boolean;
  hasUseGpt: boolean;
  hasMouseClose: boolean;
  hasEscClose: boolean;
  hasTransfer: boolean;
  hasReplace: boolean;
}

export interface Session {
  id: number;
  platform: string;
  platform_id: string;
  instance_id: string;
  context: string;
  created_at: Date;
}

export interface MessageModel {
  id: number;
  session_id: number;
  role: RoleType;
  content: string;
  sender: string;
  type: MessageType;
  created_at: Date;
}

export interface Keyword {
  id?: number;
  mode?: string;
  app_name?: string;
  platform_id?: string;
  keyword: string;
  reply: string;
  fuzzy?: boolean;
  has_regular?: boolean;
}

export interface TransferKeyword {
  id?: number;
  keyword: string;
  app_id?: string;
  fuzzy?: boolean;
  has_regular?: boolean;
  app_name?: string;
}

export interface ReplaceKeyword {
  id?: number;
  keyword: string;
  replace: string;
  app_id?: string;
  fuzzy?: boolean;
  has_regular?: boolean;
  app_name?: string;
}
