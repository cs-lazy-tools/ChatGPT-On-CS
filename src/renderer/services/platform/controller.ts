import {
  App,
  Instance,
  Keyword,
  LogBody,
  GenericConfig,
  LLMConfig,
  AccountConfig,
  PluginConfig,
  DriverConfig,
  Message,
  Session,
  MessageModel,
} from './platform';
import { GET, POST } from '../common/api/request';

export async function getPlatformList() {
  console.log('getPlatformList');
  const data = await GET<{
    data: App[];
  }>('/api/v1/base/platform/all');
  return data;
}

export async function updatePlatform(ids: string[]) {
  await POST('/api/v1/base/platform', ids);
}

export async function getReplyList({
  page,
  pageSize,
  ptfId,
}: {
  page: number;
  pageSize: number;
  ptfId?: string;
}) {
  const data = await GET<{
    total: number;
    data: Keyword[];
  }>('/api/v1/reply/list', {
    page,
    page_size: pageSize,
    platform_id: ptfId,
  });
  return data;
}

export async function addReplyKeyword(keyword: Keyword) {
  await POST('/api/v1/reply/create', keyword);
}

export async function updateReplyKeyword(keyword: Keyword) {
  await POST('/api/v1/reply/update', keyword);
}

export async function deleteReplyKeyword(id: number) {
  await POST('/api/v1/reply/delete', { id });
}

export async function updateReplyExcel(data: { path: string }) {
  await POST('/api/v1/reply/excel', data);
}

export async function exportReplyExcel() {
  const data = await GET('/api/v1/reply/excel');
  return data;
}

export async function activeConfig({
  active,
  appId,
  instanceId,
}: {
  active: boolean;
  appId?: string;
  instanceId?: string;
}) {
  await POST('/api/v1/base/platform/active', {
    active,
    appId,
    instanceId,
  });
}

export async function checkConfigActive({
  appId,
  instanceId,
}: {
  appId?: string;
  instanceId?: string;
}) {
  const data = await GET<{
    active: boolean;
  }>('/api/v1/base/platform/active', {
    appId,
    instanceId,
  });
  return data;
}

export async function getConfig({
  type,
  appId,
  instanceId,
}: {
  type: string;
  appId?: string;
  instanceId?: string;
}) {
  const data = await GET<{
    data:
      | GenericConfig
      | LLMConfig
      | AccountConfig
      | PluginConfig
      | DriverConfig;
  }>('/api/v1/base/setting', {
    appId,
    instanceId,
    type,
  });
  return data;
}

export async function updateConfig({
  type,
  appId,
  instanceId,
  cfg,
}: {
  type: string;
  appId?: string;
  instanceId?: string;
  cfg: GenericConfig | LLMConfig | AccountConfig | PluginConfig | DriverConfig;
}) {
  await POST('/api/v1/base/setting', {
    appId,
    instanceId,
    type,
    cfg,
  });
}

export async function checkGptHealth(cfg: LLMConfig) {
  const resp = await POST<{
    status: boolean;
    message: string;
  }>(
    '/api/v1/base/gpt/health',
    {
      cfg,
    },
    {
      timeout: 5000,
    },
  );
  return resp;
}

export async function checkPluginAvailability({
  code,
  ctx,
  messages,
}: {
  code: string;
  ctx: Record<string, string>;
  messages: Message[];
}) {
  const resp = await POST<{
    status: boolean;
    message: string;
    error: string;
    consoleOutput: LogBody[];
  }>('/api/v1/base/plugin/check', {
    code,
    ctx,
    messages,
  });
  return resp;
}

export async function getTasks() {
  const data = await GET<{
    data: Instance[];
  }>(`/api/v1/strategy/tasks`);
  return data;
}

export async function addTask(appId: string) {
  const data = await POST<{
    error?: string;
  }>(`/api/v1/strategy/tasks`, {
    appId,
  });
  return data;
}

export async function removeTask(taskId: string) {
  const data = await POST(`/api/v1/strategy/task/remove`, {
    taskId,
  });
  return data;
}

export async function getSessions({
  page,
  pageSize,
  keyword,
  platformId,
}: {
  page: number;
  pageSize: number;
  keyword?: string;
  platformId?: string;
}) {
  const data = await POST<{
    data: {
      count: number;
      rows: Session[];
    };
  }>('/api/v1/message/session', {
    page,
    pageSize,
    keyword,
    platformId,
  });
  return data;
}

export async function getMessages({ sessionId }: { sessionId: number }) {
  const data = await POST<{
    data: MessageModel[];
  }>('/api/v1/message/list', {
    sessionId,
  });
  return data;
}

export async function exportMessageExcel() {
  const data = await GET('/api/v1/message/excel');
  return data;
}
