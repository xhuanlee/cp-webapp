import { fetchGroupSip, fetchPageGroup, fetchUniqueGroup, fetchSipDetail } from '../services/group';

export default {
  namespace: 'group',

  state: {
    list: [],
    total: 0,
    entry: null,
    status: 'success',
    groupLoading: false,
    sipList: [],
    sipStatus: 'success',
    sipLoading: false,
    sipDetailLoading: false,
    sipDetailStatus: 'success',
    sipDetail: null,
  },

  effects: {
    *fetchPageGroup({ payload: { query, page, pageSize } }, { call, put }) {
      yield put({ type: 'addGroupLoading' });
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
      yield put({ type: 'removeGroupLoading' });
    },
    *fetchUniqueGroup({ payload: { uuid } }, { call, put }) {
      yield put({ type: 'addGroupLoading' });
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
      yield put({ type: 'removeGroupLoading' });
    },
    *fetchGroupSip({ payload: { groupUuid } }, { call, put }) {
      yield put({ type: 'addSipLoading' });
      try {
        const data = yield call(fetchGroupSip, groupUuid);
        if (data.RESULT === 'success') {
          const { list } = data.DATA;
          yield put({ type: 'setSipStatus', payload: { sipStatus: 'success' } });
          yield put({ type: 'saveSipList', payload: { sipList: list } });
        } else {
          yield put({ type: 'setSipStatus', payload: { sipStatus: 'failure' } });
          console.log(`fetch group (${groupUuid}) sips failed in model group`);
        }
      } catch (exception) {
        yield put({ type: 'setSipStatus', payload: { sipStatus: 'exception' } });
        console.log(`fetch group(${groupUuid}) sips throws exception in model group`);
        console.log(exception);
      }
      yield put({ type: 'removeSipLoading' });
    },
    *fetchSipDetail({ payload: { sipUsername } }, { call, put }) {
      yield put({ type: 'addSipDetailLoading' });
      try {
        const data = yield call(fetchSipDetail, sipUsername);
        if (data.RESULT === 'success') {
          const { entry } = data.DATA;
          yield put({ type: 'setSipDetailStatus', payload: { sipStatus: 'success' } });
          yield put({ type: 'saveSipDetail', payload: { sipDetail: entry } });
        } else {
          yield put({ type: 'setSipDetailStatus', payload: { sipStatus: 'failure' } });
          console.log(`fetch sip (${sipUsername}) failed in model group`);
        }
      } catch (exception) {
        yield put({ type: 'setSipDetailStatus', payload: { sipStatus: 'exception' } });
        console.log(`fetch sip (${sipUsername}) throws exception in model group`);
        console.log(exception);
      }
      yield put({ type: 'removeSipDetailLoading' });
    },
  },

  reducers: {
    addGroupLoading(state) {
      return { ...state, groupLoading: true };
    },
    removeGroupLoading(state) {
      return { ...state, groupLoading: false };
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
    addSipLoading(state) {
      return { ...state, sipLoading: true };
    },
    removeSipLoading(state) {
      return { ...state, sipLoading: false };
    },
    saveSipList(state, { payload: { sipList } }) {
      return { ...state, sipList };
    },
    setSipStatus(state, { payload: { sipStatus } }) {
      return { ...state, sipStatus };
    },
    addSipDetailLoading(state) {
      return { ...state, sipDetailLoading: true };
    },
    removeSipDetailLoading(state) {
      return { ...state, sipDetailLoading: false };
    },
    setSipDetailStatus(state, { payload: { sipDetailStatus } }) {
      return { ...state, sipDetailStatus };
    },
    saveSipDetail(state, { payload: { sipDetail } }) {
      return { ...state, sipDetail };
    },
  },
};
