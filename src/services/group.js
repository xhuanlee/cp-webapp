import request from '../utils/request';

export async function fetchPageGroup(params) {
  return request(`/cp-api/group/query/page?${params.toString()}`);
}

export async function fetchUniqueGroup(uuid) {
  return request(`/cp-api/group/unique/${uuid}`);
}

export async function fetchGroupSip(groupUuid) {
  return request(`/cp-api/directory/group_sip?groupUuid=${groupUuid}`);
}

export async function fetchSipDetail(sipUsername) {
  return request(`/cp-api/directory/unique?sip=${sipUsername}`);
}
