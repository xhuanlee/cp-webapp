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
  return request(`/cp-api/directory/unique/status?sip=${sipUsername}`);
}

export async function checkSipUsername(username) {
  return request(`/cp-api/directory/check?sip=${username}`);
}

export async function newSip(sip) {
  console.log('new_sip');
  console.log(sip);

  return request('/cp-api/directory/sipuser', {
    method: 'POST',
    body: sip,
  });
}

export async function deleteGroupSip(groupUuid, sipUsername) {
  console.log(`delete sip: ${groupUuid}, ${sipUsername}`);
  return request(`/cp-api/directory/sipuser?groupUuid=${groupUuid}&username=${sipUsername}`, {
    method: 'DELETE',
  });
}
