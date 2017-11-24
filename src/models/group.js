import { fetchPageGroup, fetchUniqueGroup } from '../services/group';

export default {
  namespace: 'group',

  state: {
    list: [],
    total: 0,
    entry: null,
    status: 'success',
    loading: false,
  },

  effects: {
    *fetchPageGroup({ payload: { query, page, pageSize } }, { call, put }) {
      yield put({ type: 'addLoading' });
      try {
        const params = new URLSearchParams({ query, page, pageSize });
        const data = yield call(fetchPageGroup, params);
        if (data.RESULT === 'success') {
          const { list, total } = data.DATA;
          yield put({ type: 'setStatus', payload: { status: 'success' } });
          yield put({ type: 'saveList', payload: { list, total } });
        } else {
          yield put({ type: 'setStatus', payload: { status: 'failure' } });
          console.log('fetch group page list failed in model group');
        }
      } catch (exception) {
        yield put({ type: 'setStatus', payload: { status: 'exception' } });
        console.log('fetch group page list throws exception in model group');
        console.log(exception);
      }
      yield put({ type: 'removeLoading' });
    },
    *fetchUniqueGroup({ payload: { uuid } }, { call, put }) {
      yield put({ type: 'addLoading' });
      try {
        const data = yield call(fetchUniqueGroup, uuid);
        if (data.RESULT === 'success') {
          const { entry } = data.DATA;
          yield put({ type: 'setStatus', payload: { status: 'success' } });
          yield put({ type: 'saveEntry', payload: { entry } });
        } else {
          yield put({ type: 'setStatus', payload: { status: 'failure' } });
          console.log(`fetch unique group(${uuid}) failed in model group`);
        }
      } catch (exception) {
        yield put({ type: 'setStatus', payload: { status: 'exception' } });
        console.log(`fetch unique group(${uuid}) throws exception in model group`);
        console.log(exception);
      }
      yield put({ type: 'removeLoading' });
    },
  },

  reducers: {
    addLoading(state) {
      return { ...state, loading: true };
    },
    removeLoading(state) {
      return { ...state, loading: false };
    },
    saveList(state, { payload: { list, total } }) {
      return { ...state, list, total };
    },
    setStatus(state, { payload: { status } }) {
      return { ...state, status };
    },
    saveEntry(state, { payload: { entry } }) {
      return { ...state, entry };
    },
  },
};
