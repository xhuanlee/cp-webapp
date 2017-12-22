import request from '../utils/request';

export async function fetchCdrByMember(memberUuid, page, pageSize, query, startDt, endDt) {
  let params = {
    memberUuid,
    page: page || '',
    pageSize: pageSize || '',
    queryNumber: query || '',
    startTime: startDt || '',
    endTime: endDt || '',
  };
  params = new URLSearchParams(params);
  return request(`/cp-api/cdr/member?${params.toString()}`);
}
