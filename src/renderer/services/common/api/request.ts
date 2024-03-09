import axios, {
  Method,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

interface ConfigType {
  headers?: { [key: string]: string };
  hold?: boolean;
  timeout?: number;
}
interface ResponseDataType {
  code: number;
  message: string;
  data: any;
}

/**
 * 请求开始
 */
function requestStart(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  return config;
}

/**
 * 请求成功,检查请求头
 */
function responseSuccess(response: AxiosResponse<ResponseDataType>) {
  return response;
}
/**
 * 响应数据检查
 */
function checkRes(data: ResponseDataType) {
  if (data === undefined) {
    return Promise.reject('服务器异常');
  }
  if (data?.code && (data.code < 200 || data.code >= 400)) {
    return Promise.reject(data);
  }
  return data;
}

/**
 * 响应错误
 */
function responseError(err: any) {
  if (!err) {
    return Promise.reject({ message: '未知错误' });
  }

  // 检查网络错误（无响应）
  if (err.message === 'Network Error') {
    return Promise.reject({ message: '服务还在启动，请稍后尝试' });
  }

  // 检查超时错误
  if (err.code === 'ECONNABORTED') {
    return Promise.reject({ message: '请求超时，请稍后再试' });
  }

  // 检查是否有响应体和状态码
  if (err.response) {
    // 这里可以根据 err.response.status 进行更详细的错误处理
    return Promise.reject(err.response.data);
  }

  // 对于其他类型的错误，直接返回
  return Promise.reject(err);
}

/* 创建请求实例 */
const instance = axios.create({
  timeout: 60000, // 超时时间
  headers: {
    'content-type': 'application/json',
    'Cache-Control': 'no-cache',
  },
});

/* 请求拦截 */
instance.interceptors.request.use(requestStart, (err) => Promise.reject(err));
/* 响应拦截 */
instance.interceptors.response.use(responseSuccess, (err) =>
  Promise.reject(err),
);

export function request(
  url: string,
  data: any,
  config: ConfigType,
  method: Method,
): any {
  /* 去空 */
  Object.keys(data).forEach((key) => {
    if (data[key] === null || data[key] === undefined) {
      delete data[key]; // 如果属性值为 null 或 undefined，则删除该属性
    }
  });

  return instance
    .request({
      baseURL: `http://127.0.0.1:${window.electron.getPort()}`,
      url,
      method,
      data: ['POST', 'PUT'].includes(method) ? data : null,
      params: !['POST', 'PUT'].includes(method) ? data : null,
      ...config, // custom config
    })
    .then((res) => checkRes(res.data))
    .catch((err) => responseError(err));
}

/**
 * api请求方式
 * @param {String} url
 * @param {Any} params
 * @param {Object} config
 * @returns
 */
export function GET<T = undefined>(
  url: string,
  params = {},
  config: ConfigType = {},
): Promise<T> {
  return request(url, params, config, 'GET');
}

export function POST<T = undefined>(
  url: string,
  data = {},
  config: ConfigType = {},
): Promise<T> {
  return request(url, data, config, 'POST');
}

export function PUT<T = undefined>(
  url: string,
  data = {},
  config: ConfigType = {},
): Promise<T> {
  return request(url, data, config, 'PUT');
}

export function DELETE<T = undefined>(
  url: string,
  data = {},
  config: ConfigType = {},
): Promise<T> {
  return request(url, data, config, 'DELETE');
}
