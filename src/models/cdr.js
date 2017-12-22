import { fetchCdrByMember } from '../services/cdr';
import { SUCCESS } from '../constants/AllConstants';

export default {
  namespace: 'cdr',

  state: {
    list: [],
    total: 0,
    loading: false,
  },

  effects: {
    *fetchCdrByMember({ payload: { memberUuid, page, pageSize,
      query, startDt, endDt } }, { call, put }) {
      yield put({ type: 'addLoading' });
      const data = yield call(fetchCdrByMember, memberUuid, page, pageSize, query, startDt, endDt);
      if (data.RESULT === SUCCESS) {
        yield put({ type: 'saveCdrList', payload: { list: data.DATA.list } });
        yield put({ type: 'changeTotal', payload: { total: data.DATA.total } });
      } else {
        console.log('查询用户CDR失败');
      }
      yield put({ type: 'removeLoading' });
    },
  },

  reducers: {
    changeTotal(state, { payload: { total } }) {
      return { ...state, total };
    },
    saveCdrList(state, { payload: { list } }) {
      return { ...state, list };
    },
    addLoading(state) {
      return { ...state, loading: true };
    },
    removeLoading(state) {
      return { ...state, loading: false };
    },
  },
};
