import request from '../utils/request';

export async function queryPhone(phone) {
  return request(`/crm/phone/${phone}`);
}
