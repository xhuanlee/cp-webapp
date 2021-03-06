import fetch from 'dva/fetch';
import { notification } from 'antd';
import { getItem } from './cputils';
import { TOKEN_KEY } from '../constants/AllConstants';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: response.statusText,
  });
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const token = getItem(TOKEN_KEY);
  const defaultOptions = {
    credentials: 'include',
    headers: {
      token,
    },
  };
  const newOptions = { ...defaultOptions, ...options };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
    newOptions.headers = {
      Accept: 'application/json',
      // 'Content-Type': 'application/json; charset=utf-8',
      'Content-Type': 'application/x-www-form-urlencoded',
      ...newOptions.headers,
    };
    // newOptions.body = JSON.stringify(newOptions.body);
    const body = new URLSearchParams(newOptions.body);
    newOptions.body = body.toString();
  }

  return fetch(url, newOptions)
    .then(checkStatus)
    .then(response => response.json())
    .catch((error) => {
      const { status } = error.response;
      if (status === 401) {
        notification.error({
          message: error.message,
          description: '请登录后在尝试哦',
        });
      }
      if (error.code) {
        notification.error({
          message: error.name,
          description: error.message,
        });
      }
      if ('stack' in error && 'message' in error) {
        notification.error({
          message: `请求错误: ${url}`,
          description: error.message,
        });
      }
      return error;
    });
}
