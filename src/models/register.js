import { message } from 'antd';
import { fakeRegister } from '../services/api';
import { checkRegister, register } from '../services/notlogin';
import { SUCCESS } from '../constants/AllConstants';

export default {
  namespace: 'register',

  state: {
    status: undefined,
    phoneC: 0,
    emailC: 0,
    registerCheck: true,
    email: undefined,
  },

  effects: {
    *submit(_, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(fakeRegister);
      yield put({
        type: 'registerHandle',
        payload: response,
      });
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
    },
    *submitCp({ payload: { email, password, phone } }, { call, put }) {
      yield put({ type: 'changeSubmitting', payload: true });
      // 检查邮箱，手机是否已经注册过
      const data = yield call(checkRegister, email, phone || '');
      if (data.RESULT === SUCCESS) {
        const { phoneC, emailC } = data.DATA;
        if (phoneC > 0 || emailC > 0) {
          console.log('');
          yield put({ type: 'changeEmailCount', payload: { emailC } });
          yield put({ type: 'changePhoneCount', payload: { phoneC } });
          yield put({ type: 'changeSubmitting', payload: false });
          // 手机号码或者邮箱已经注册过了
          return null;
        }
      } else {
        // 验证失败，直接返回
        message.error('注册验证失败，请稍候再试!');
        yield put({ type: 'changeSubmitting', payload: false });
        return null;
      }
      const newUser = { email, password };
      if (phone) {
        newUser.phone = phone;
      }
      const regData = yield call(register, newUser);
      if (regData.RESULT === SUCCESS) {
        // 注册成功
        yield put({ type: 'registerHandle', payload: { status: SUCCESS } });
        yield put({ type: 'changeSubmitting', payload: false });
        yield put({ type: 'saveEmail', payload: { email } });
      } else {
        message.error('注册失败，请稍候再试!');
        yield put({ type: 'changeSubmitting', payload: false });
      }
    },
  },

  reducers: {
    registerHandle(state, { payload }) {
      return {
        ...state,
        status: payload.status,
      };
    },
    changeSubmitting(state, { payload }) {
      return {
        ...state,
        submitting: payload,
      };
    },
    changeEmailCount(state, { payload: { emailC } }) {
      return {
        ...state,
        emailC,
      };
    },
    changePhoneCount(state, { payload: { phoneC } }) {
      return {
        ...state,
        phoneC,
      };
    },
    saveEmail(state, { payload: { email } }) {
      return { ...state, email };
    },
  },
};
