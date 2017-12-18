import { fetchCallBtn } from '../services/notlogin';
import { SUCCESS } from '../constants/AllConstants';

export default {
  namespace: 'home',

  state: {
    mainCallBtn: [],
    totalCallBtn: 0,
    loading: false,
  },

  effects: {
    *fetchCallBtn({ payload: { page, pageSize } }, { call, put }) {
      yield put({ type: 'changeLoading', payload: true });
      const data = yield call(fetchCallBtn, page, pageSize);
      if (data.RESULT === SUCCESS) {
        yield put({ type: 'saveCallBtns', payload: { mainCallBtn: data.DATA.list, totalCallBtn: data.DATA.total } });
      } else {
        console.log('获取企业展示块失败，请注意.');
      }
      yield put({ type: 'changeLoading', payload: false });
    },
  },

  reducers: {
    saveCallBtns(state, { payload: { mainCallBtn, totalCallBtn } }) {
      return { ...state, mainCallBtn, totalCallBtn };
    },
    changeLoading(state, { payload: { loading } }) {
      return { ...state, loading };
    },
  },
};
