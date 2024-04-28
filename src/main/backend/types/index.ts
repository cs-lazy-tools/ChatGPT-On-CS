export type RoleType = 'assistant' | 'user' | 'system';
export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'file'
  | 'mention'
  | 'goods';

export interface MessageDTO {
  session_id: number;
  platform_id: string;
  unique: string;
  content: string; // If it's an image, this is the URL of the image
  role: RoleType; // assistant, user
  msg_type: MessageType;
}

export interface ReplyDTO {
  content: string;
  msg_type: MessageType;
}

export interface Platform {
  id: string;
  name: string;
  impl: boolean;
  type?: string;
  urls?: string[];
  avatar?: string;
  desc?: string;
}
