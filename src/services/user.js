import request from '../utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/api/currentUser');
}

export async function fetchUserInfo(uuid) {
  return request(`/cp-api/member/unique/${uuid}`);
}

export async function fetchGroupByUuid(uuid) {
  return request(`/cp-api/group/unique/${uuid}`);
}

export async function changePassword(uuid, oldPassword, newPassword) {
  return request('/cp-api/member/change_password', {
    method: 'POST',
    body: {
      uuid,
      oldPassword,
      newPassword,
    },
  });
}

export async function isUsedPhone(phone) {
  return request(`/cp-api/member/phoneused?phone=${phone}`);
}

export async function isUsedEmail(email) {
  return request(`/cp-api/member/phoneused?phone=${email}`);
}

export async function updateMember(member) {
  return request('/cp-api/member/update/selective', {
    method: 'POST',
    body: member,
  });
}
