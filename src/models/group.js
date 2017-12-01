import {
  fetchGroupSip, fetchPageGroup, fetchUniqueGroup, fetchSipDetail, newSip,
  checkSipUsername } from '../services/group';
import { FIELD_SIP_USERNAME, FIELD_SIP_PASSWORD, FIELD_SIP_TYPE } from '../constants/GroupConstants';
import { ERROR, EXCEPTION, SUCCESS, VALIDATING } from '../constants/AllConstants';

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
    addSipModal: false,
    addSipStatus: 'success',
    modalConfirmLoading: false,
    sipDetailLoading: false,
    sipDetailStatus: 'success',
    sipDetail: null,
    usernameValidate: null,
    passwordValidate: null,
    typeValidate: null,
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
    *newSip({ payload: { sip } }, { call, put }) {
      try {
        yield put({ type: 'addModalConfirmLoading' });
        yield put({ type: 'setAddSipValidate', payload: { field: FIELD_SIP_USERNAME, status: VALIDATING } });
        yield put({ type: 'setAddSipValidate', payload: { field: FIELD_SIP_PASSWORD, status: VALIDATING } });
        let validate = true;

        if (sip && sip.username) {
          const checkData = yield call(checkSipUsername, sip.username);
          if (checkData.RESULT === 'success') {
            yield put({ type: 'setAddSipValidate', payload: { field: FIELD_SIP_USERNAME, status: SUCCESS } });
          } else {
            yield put({ type: 'setAddSipValidate', payload: { field: FIELD_SIP_USERNAME, status: ERROR, msg: `${sip.username}已被使用` } });
            validate = false;
          }
        } else {
          yield put({ type: 'setAddSipValidate', payload: { field: FIELD_SIP_USERNAME, status: ERROR, msg: '不能为空' } });
          validate = false;
        }
        if (sip && sip.password) {
          yield put({ type: 'setAddSipValidate', payload: { field: FIELD_SIP_PASSWORD, status: SUCCESS } });
        } else {
          yield put({ type: 'setAddSipValidate', payload: { field: FIELD_SIP_PASSWORD, status: ERROR, msg: '不能为空' } });
          validate = false;
        }
        if (!validate) {
          yield put({ type: 'removeModalConfirmLoading' });
          return;
        }

        const data = yield call(newSip, sip);
        console.log('new_sip result data');
        console.log(data);
        yield put({ type: '', payload: { addSipStatus: data.RESULT } });
        yield put({ type: 'removeModalConfirmLoading' });
      } catch (exception) {
        console.log('save new_sip error');
        yield put({ type: '', payload: { addSipStatus: EXCEPTION } });
        yield put({ type: 'removeModalConfirmLoading' });
      }
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
    showAddSipModal(state) {
      return { ...state, addSipModal: true };
    },
    hideAddSipModal(state) {
      return { ...state, addSipModal: false };
    },
    addModalConfirmLoading(state) {
      return { ...state, modalConfirmLoading: true };
    },
    removeModalConfirmLoading(state) {
      return { ...state, modalConfirmLoading: false };
    },
    setAddSipStatus(state, { payload: { addSipStatus } }) {
      return { ...state, addSipStatus };
    },
    setAddSipValidate(state, { payload: { field, status, msg } }) {
      switch (field) {
        case FIELD_SIP_USERNAME: {
          return { ...state, usernameValidate: { status, msg } };
        }
        case FIELD_SIP_PASSWORD: {
          return { ...state, passwordValidate: { status, msg } };
        }
        case FIELD_SIP_TYPE: {
          return { ...state, typeValidate: { status, msg } };
        }
        default: {
          return state;
        }
      }
    },
  },
};
