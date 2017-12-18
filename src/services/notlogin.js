import request from '../utils/request';
import { getExplorer } from '../utils/cputils';

export async function callPassLogin(username, password) {
  const os = getExplorer();
  const params = new URLSearchParams({ username, password, os });
  return request(`/cp-api/system/member/login?${params.toString()}`);
}

export async function fetchGroupByUrl(cpUrl) {
  return request(`/cp-api/group/cpurl/${cpUrl}`);
}

export async function checkRegister(email, phone) {
  const params = new URLSearchParams({ email, phone, username: '' });
  return request(`/cp-api/member/registercheck?${params.toString()}`);
}

export async function register(newUser) {
  return request('/cp-api/member/register', {
    method: 'POST',
    body: newUser,
  });
}

export async function fetchCallBtn(page = 1, pageSize = 10) {
  return request(`/cp-api/site/query/page?page=${page}&pageSize=${pageSize}`);
}
