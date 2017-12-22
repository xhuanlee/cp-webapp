import { fetchGroupSip, fetchGroupDevice } from '../services/sip';
import { SUCCESS } from '../constants/AllConstants';

export default {
  namespace: 'sip',

  state: {
    groupSip: [],
    groupDevice: [],
    loading: false,
  },

  effects: {
    *fetchGroupSip({ payload: { groupUuid } }, { call, put }) {
      yield put({ type: 'addLoading' });
      const data = yield call(fetchGroupSip, groupUuid);
      if (data.RESULT === SUCCESS) {
        yield put({ type: 'saveGroupSip', payload: { groupSip: data.DATA.list } });
      } else {
        console.log('查询用户公司SIP账号失败');
      }
      yield put({ type: 'removeLoading' });
    },
    *fetchGroupDevice({ payload: { groupUuid } }, { call, put }) {
      yield put({ type: 'addLoading' });
      const data = yield call(fetchGroupDevice, groupUuid);
      if (data.RESULT === SUCCESS) {
        yield put({ type: 'saveGroupDevice', payload: { groupDevice: data.DATA.list } });
      } else {
        console.log('查询用户公司网关设备失败');
      }
      yield put({ type: 'removeLoading' });
    },
  },

  reducers: {
    saveGroupSip(state, { payload: { groupSip } }) {
      return { ...state, groupSip };
    },
    saveGroupDevice(state, { payload: { groupDevice } }) {
      return { ...state, groupDevice };
    },
    addLoading(state) {
      return { ...state, loading: true };
    },
    removeLoading(state) {
      return { ...state, loading: false };
    },
  },
};
