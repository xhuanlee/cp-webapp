import request from '../utils/request';
import { getExplorer } from '../utils/cputils';

export async function callPassLogin(username, password) {
  const os = getExplorer();
  const params = new URLSearchParams({ username, password, os });
  return request(`/cp-api/system/member/login${params.toString()}`);
}
