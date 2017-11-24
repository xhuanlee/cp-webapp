import request from '../utils/request';

export async function fetchPageGroup(params) {
  return request(`/cp-api/group/query/page?${params.toString()}`);
}

export async function fetchUniqueGroup(uuid) {
  return request(`/cp-api/group/unique/${uuid}`);
}
