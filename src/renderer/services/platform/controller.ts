import { Platform, Reply, Config, Message } from './platform';
import { GET, POST } from '../common/api/request';

export async function getPlatformList() {
  const data = await GET<{
    data: Platform[];
  }>('/api/v1/base/platform/all');
  return data;
}

export async function updatePlatform(ids: string[]) {
  await POST('/api/v1/base/platform', ids);
}

export async function updateRunner(data: {
  ids: string[];
  is_paused: boolean;
  is_keyword_match: boolean;
  is_use_gpt: boolean;
}) {
  await POST('/api/v1/base/runner', data);
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
  await POST('/api/v1/reply/delete', { id });
}

export async function updateReplyExcel(data: { path: string }) {
  await POST('/api/v1/reply/excel', data);
}

export async function exportReplyExcel() {
  const data = await GET('/api/v1/reply/excel');
  return data;
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

export async function getPlatformSetting(platformId: string) {
  const data = await GET<any>('/api/v1/base/platform/setting', { platformId });
  return data;
}

export async function updatePlatformSetting(data: {
  platformId: string;
  settings: any;
}) {
  await POST('/api/v1/base/platform/setting', data);
}

export async function checkGptHealth(data: {
  base_url: string;
  key: string;
  model: string;
  use_dify: boolean;
}) {
  const resp = await GET<{
    status: boolean;
    message: string;
  }>('/api/v1/base/gpt/health', data, {
    timeout: 5000,
  });
  return resp;
}
