import { Platform, Reply, Config, Message } from './platform';
import { DELETE, GET, POST } from '../common/api/request';

export async function getPlatformList() {
  const data = await GET<{
    data: Platform[];
  }>('/api/v1/base/platform/all');
  return data;
}

export async function getActivePlatformList() {
  const data = await GET<{
    data: Platform[];
  }>('/api/v1/base/platform/active');
  return data;
}

export async function updatePlatform(ids: string[]) {
  await POST('/api/v1/base/platform', ids);
}

export async function updateRunner(isPaused: boolean, isKeywordMatch: boolean) {
  await POST('/api/v1/base/runner', {
    is_paused: isPaused,
    is_keyword_match: isKeywordMatch,
  });
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
    data: Reply[];
  }>('/api/v1/reply/list', {
    page,
    page_size: pageSize,
    platform_id: ptfId,
  });
  return data;
}

export async function addReplyKeyword(keyword: Reply) {
  await POST('/api/v1/reply/create', keyword);
}

export async function updateReplyKeyword(keyword: Reply) {
  await POST('/api/v1/reply/update', keyword);
}

export async function deleteReplyKeyword(id: number) {
  await DELETE('/api/v1/reply/delete', { id });
}

export async function getConfig() {
  const data = await GET<{
    data: Config;
  }>('/api/v1/base/settings');
  return data;
}

export async function updateConfig(config: Config) {
  await POST('/api/v1/base/settings', config);
}

export async function getMessageList({
  page,
  pageSize,
  ptfId,
  keyword,
  startTime,
  endTime,
}: {
  page: number;
  pageSize: number;
  ptfId?: string;
  keyword?: string;
  startTime?: string;
  endTime?: string;
}) {
  const data = await GET<{
    total: number;
    data: {
      [key: string]: Message[];
    };
  }>('/api/v1/msg/list', {
    page,
    page_size: pageSize,
    platform_id: ptfId,
    keyword,
    start_time: startTime,
    end_time: endTime,
  });
  return data;
}

export async function getPlatformSettings() {
  const data = await GET<{
    data: {
      platform_id: string;
      openai_url: string;
      api_key: string;
      prompt: string;
      active: boolean;
    }[];
  }>('/api/v1/base/platform/settings');
  return data;
}

export async function updatePlatformSettings(settings: {
  openai_url: string;
  api_key: string;
  prompt: string;
  active: boolean;
}) {
  await POST('/api/v1/base/platform/settings', settings);
}
