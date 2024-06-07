import { APIError } from 'openai';

export type MinimaxAPIResponse = {
  base_resp: {
    status_code: number;
    status_msg: string;
  };
};

export function assertStatusCode(data: MinimaxAPIResponse) {
  if (data.base_resp.status_code === 0) return;

  const error = {
    code: data.base_resp.status_code,
    message: data.base_resp.status_msg,
  };

  throw new APIError(undefined, error, undefined, undefined);
}
