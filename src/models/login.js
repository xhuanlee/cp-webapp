import { routerRedux } from 'dva/router';
import { fakeAccountLogin, fakeMobileLogin } from '../services/api';
import { isNotBlank, removeItem, saveItem } from '../utils/cputils';
import { ALREADY_LOGIN, GROUP_KEY, TOKEN_KEY, USER_KEY } from '../constants/AllConstants';
import { callPassLogin } from '../services/notlogin';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *callpassLogin({ payload: { username, password, redirect, group } }, { call, put }) {
      try {
        yield put({ type: 'changeLoginError', payload: { loginError: null } });
        const data = yield call(callPassLogin, username, password);
        if (data.RESULT === 'success') {
          saveItem(USER_KEY, JSON.stringify(data.DATA.entry));
          // 如果有公司信息，缓存到 cookie 中，否则清空 cookie
          if (data.DATA.group) {
            saveItem(GROUP_KEY, JSON.stringify(data.DATA.group));
          } else {
            removeItem(GROUP_KEY);
          }
          saveItem(TOKEN_KEY, data.DATA.token);
          saveItem(ALREADY_LOGIN, 'true');
          yield put({ type: 'user/saveCurrentUser', payload: { currentUser: data.DATA.entry } });
          yield put({ type: 'user/saveToken', payload: { token: data.DATA.entry } });
          // 更新公司信息
          yield put(({ type: 'user/saveCurrentGroup', payload: { currentGroup: data.DATA.group } }));

          if (isNotBlank(redirect, true)) {
            yield put(routerRedux.push(redirect));
          }
          if (isNotBlank(group, true)) {
            yield put(routerRedux.push(`/e/${group}/webphone`));
          } else {
            yield put(routerRedux.push('/main/webphone'));
          }
        } else {
          yield put({ type: 'changeLoginError', payload: { loginError: `error_${Math.random()}` } });
        }
      } catch (exception) {
        console.log(exception);
        yield put({ type: 'changeLoginError', payload: { loginError: `exception_${Math.random()}` } });
      }
    },
    *callpassLogout({ payload: { group } }, { put }) {
      try {
        removeItem(USER_KEY);
        removeItem(GROUP_KEY);
        removeItem(TOKEN_KEY);
        removeItem(ALREADY_LOGIN);
        yield put({ type: 'user/saveCurrentUser', payload: { currentUser: {} } });
        if (isNotBlank(group)) {
          yield put(routerRedux.push(`/e/${group}`));
        } else {
          yield put(routerRedux.push('/user/login'));
        }
      } catch (exception) {
        console.log('logout failed');
      }
    },
    *accountSubmit({ payload }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(fakeAccountLogin, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
    },
    *mobileSubmit(_, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(fakeMobileLogin);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
    },
    *logout(_, { put }) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
        },
      });
      yield put(routerRedux.push('/user/login'));
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
    changeSubmitting(state, { payload }) {
      return {
        ...state,
        submitting: payload,
      };
    },
    changeLoginError(state, { payload }) {
      return { ...state, loginError: payload.loginError };
    },
  },
};
