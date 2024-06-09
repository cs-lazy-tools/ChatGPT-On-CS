export enum StrategyServiceStatusEnum {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
}

export enum PlatformTypeEnum {
  HOT = 'HOT',
  E_COMMERCE = 'E_COMMERCE',
  RECRUIT = 'RECRUIT',
  LAW = 'LAW',
  OTHER = 'OTHER',
  ME_MEDIA = 'ME_MEDIA',
}

export type RoleType = 'SELF' | 'OTHER' | 'SYSTEM';
export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';

export type Context = Map<string, string>;

export interface MessageDTO {
  sender: string;
  content: string;
  role: RoleType; // assistant, user
  type: MessageType;
}

export interface ReplyDTO {
  content: string;
  type: MessageType;
}

export interface Platform {
  id: string;
  name: string;
  type?: string;
  avatar?: string;
  desc?: string;
  env?: string;
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
