import OpenAI from 'openai';

import ErnieAI, { ErnieAIOptions } from './ernie';
import GeminiAI, { GeminiAIOptions } from './gemini';
import HunYuanAI, { HunYuanAIOptions } from './hunyuan';
import MinimaxAI, { MinimaxAIOptions } from './minimax';
import QWenAI, { QWenAIOptions } from './qwen';
import SparkAI, { SparkAIOptions } from './spark';
import VYroAI, { VYroAIOptions } from './vyro';

export {
  ErnieAI,
  type ErnieAIOptions,
  GeminiAI,
  type GeminiAIOptions,
  HunYuanAI,
  type HunYuanAIOptions,
  MinimaxAI,
  type MinimaxAIOptions,
  OpenAI,
  QWenAI,
  type QWenAIOptions,
  SparkAI,
  type SparkAIOptions,
  VYroAI,
  type VYroAIOptions,
};

export {
  OpenAIError,
  APIError,
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  BadRequestError,
  AuthenticationError,
  InternalServerError,
  PermissionDeniedError,
  UnprocessableEntityError,
} from 'openai';

export * from './resource';
export * from './streaming';
export * from './util';

export default {
  version: process.env.PKG_VERSION,
};
