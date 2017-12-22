import { message } from 'antd';
import { query as queryUsers, queryCurrent, fetchUserInfo,
  fetchGroupByUuid, changePassword, isUsedEmail, isUsedPhone,
  updateMember,
} from '../services/user';
import { fetchUserByLink } from '../services/client';
import { SUCCESS } from '../constants/AllConstants';
import { isNotBlank } from '../utils/cputils';

export default {
  namespace: 'user',

  state: {
    list: [],
    loading: false,
    currentUser: {},
    currentGroup: {},
    token: null,
    passwordLoading: false,
    saveUserLoading: false,
    emailChecked: true,
    phoneChecked: true,
    linkNameChecked: true,
  },

  effects: {
    *fetch(_, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
    *fetchUserInfo({ payload: { uuid } }, { call, put }) {
      yield put({ type: 'changeLoading', payload: { loading: true } });
      const data = yield call(fetchUserInfo, uuid);
      if (data.RESULT === SUCCESS) {
        yield put({ type: 'saveCurrentUser', payload: { currentUser: data.DATA.entry } });
      } else {
        console.log('获取用户信息失败');
      }
      yield put({ type: 'changeLoading', payload: { loading: false } });
    },
    *fetchGroupByUuid({ payload: { uuid } }, { call, put }) {
      const data = yield call(fetchGroupByUuid, uuid);
      if (data.RESULT === SUCCESS) {
        yield put({ type: 'saveCurrentGroup', payload: { currentGroup: data.DATA.entry } });
      } else {
        console.log('获取用户公司信息失败');
      }
    },
    *changePassword({ payload: { uuid, oldPassword, newPassword } }, { call, put }) {
      yield put({ type: 'changePasswordLoading', payload: { passwordLoading: true } });
      const data = yield call(changePassword, uuid, oldPassword, newPassword);
      if (data.RESULT === SUCCESS) {
        message.success('已更改为新密码');
        yield put({ type: 'fetchUserInfo', payload: { uuid } });
      } else {
        message.error('修改密码失败');
      }
      yield put({ type: 'changePasswordLoading', payload: { passwordLoading: false } });
    },
    *updateMember({ payload: { member } }, { call, put, select }) {
      yield put({ type: 'changeSaveUserLoading', payload: { saveUserLoading: true } });
      const user = yield select(state => state.user.currentUser);
      const newMember = { ...user, ...member };
      let checked = true;
      const { email, phone, linkName } = member;
      if (isNotBlank(email) && email !== user.email) {
        const emailData = yield call(isUsedEmail, email);
        if (emailData.RESULT === SUCCESS) {
          if (emailData.DATA.count > 0) {
            yield put({ type: 'changeEmailChecked', payload: { emailChecked: false } });
            checked = false;
          } else {
            newMember.emailVerified = 'false';
          }
        } else {
          yield put({ type: 'changeEmailChecked', payload: { emailChecked: false } });
          checked = false;
        }
      }
      if (isNotBlank(phone) && phone !== user.phone) {
        const phoneData = yield call(isUsedPhone, phone);
        if (phoneData.RESULT === SUCCESS) {
          if (phoneData.DATA.count > 0) {
            yield put({ type: 'changePhoneChecked', payload: { phoneChecked: false } });
            checked = false;
          } else {
            newMember.phoneVerified = 'false';
          }
        } else {
          yield put({ type: 'changePhoneChecked', payload: { phoneChecked: false } });
          checked = false;
        }
      }
      if (isNotBlank(linkName) && linkName !== user.linkName) {
        const emailData = yield call(fetchUserByLink, linkName);
        if (emailData.RESULT === SUCCESS) {
          const linkEntry = emailData.DATA.entry;
          if (linkEntry && (linkEntry.uuid !== user.uuid)) {
            yield put({ type: 'changeLinkNameChecked', payload: { linkNameChecked: false } });
            checked = false;
          }
        } else {
          yield put({ type: 'changeLinkNameChecked', payload: { linkNameChecked: false } });
          checked = false;
        }
      }
      if (checked) {
        const data = yield call(updateMember, newMember);
        if (data.RESULT === SUCCESS) {
          message.success('保存成功');
          yield put({ type: 'fetchUserInfo', payload: { uuid: newMember.uuid } });
        } else {
          message.error('保存失败，请稍后再试');
        }
      }
      yield put({ type: 'changeSaveUserLoading', payload: { saveUserLoading: false } });
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    changeLoading(state, { payload: { loading } }) {
      return {
        ...state,
        loading,
      };
    },
    saveCurrentUser(state, { payload: { currentUser } }) {
      return {
        ...state,
        currentUser,
      };
    },
    saveCurrentGroup(state, { payload: { currentGroup } }) {
      return {
        ...state,
        currentGroup,
      };
    },
    saveToken(state, { payload: { token } }) {
      return {
        ...state,
        token,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
    changePasswordLoading(state, { payload: { passwordLoading } }) {
      return { ...state, passwordLoading };
    },
    changeSaveUserLoading(state, { payload: { saveUserLoading } }) {
      return { ...state, saveUserLoading };
    },
    changeEmailChecked(state, { payload: { emailChecked } }) {
      return { ...state, emailChecked };
    },
    changePhoneChecked(state, { payload: { phoneChecked } }) {
      return { ...state, phoneChecked };
    },
    changeLinkNameChecked(state, { payload: { linkNameChecked } }) {
      return { ...state, linkNameChecked };
    },
  },
};
