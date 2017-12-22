import request from '../utils/request';

export async function fetchGroupSip(groupUuid) {
  return request(`/cp-api/directory/group_sip?groupUuid=${groupUuid}`);
}

export async function fetchGroupDevice(groupUuid) {
  return request(`/cp-api/gwdevice/group/${groupUuid}`);
}
