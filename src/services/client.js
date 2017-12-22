import axios from 'axios';
import request from '../utils/request';

export async function getIp() {
  return axios.get('https://api.ipify.org?format=json', {
    withCredentials: false,
  });
}

export async function getArea(ip) {
  return request(`/cp-api/system/queryip?ip=${ip}`);
}

export async function fetchUserByLink(linkName) {
  return request(`/cp-api/member/query/link?linkName=${linkName}`);
}

export async function fetchUniqueSite(uuid) {
  return request(`/cp-api/site/query/unique/${uuid}`);
}

export async function addWbClick(wbClick) {
  return request('/cp-api/wbclick/add', {
    method: 'POST',
    body: wbClick,
  });
}
