import { CALL_STATUS_INIT, SOCKET_STATUS_DISCONNECTED } from '../utils/webphoneutil';
import { queryPhone } from '../services/phone';

export default {
  namespace: 'phone',

  state: {
    callStatus: CALL_STATUS_INIT,
    socketStatus: SOCKET_STATUS_DISCONNECTED,
  },

  effects: {
    *notice({ payload: { caller, callerName, callee } }, { call, put }) {
      console.log(`${caller}${callerName}${callee}`);
      const data = yield call(queryPhone, caller);
      console.log(data);
      if (data.success === 'true') {
        const phone = data.data;
        let title = null;
        let body = null;
        if (phone.company !== '') {
          phone.company = phone.company.replace(/,$/g, '');
          title = phone.company;
          body = caller;
        } else {
          title = caller;
          body = phone.location;
          if (phone.tip && phone.tip !== '') {
            title = `${caller}(${phone.location})`;
            body = `可能是 ${phone.tip}`;
          }
        }
        yield put({ type: 'notificationTo', payload: { title, body } });
      } else {
        let title = null;
        let body = null;
        if (callerName && callerName !== '') {
          title = caller;
          body = callerName;
        } else {
          title = caller;
          body = '新的来电';
        }
        yield put({ type: 'notificationTo', payload: { title, body } });
      }
    },
  },

  reducers: {
    changeCallStatus(state, { payload: { callStatus } }) {
      return { ...state, callStatus };
    },
    changeSocketStatus(state, { payload: { socketStatus } }) {
      return { ...state, socketStatus };
    },
    notificationTo(state, { payload: { title, body, icon } }) {
      let localIcon = icon;
      if (!icon) {
        localIcon = 'https://callpass.cn/images/logo/150x150bb.jpg';
      }
      if (Notification.permission === 'granted') {
        console.log('允许网站通知');
        const noti = new Notification(title, {
          body,
          icon: localIcon,
        });
        console.log(noti && noti.body);
      } else {
        Notification.requestPermission().then((permission) => {
          if (permission === 'denied') {
            console.log('我不需要网站通知');
          } else if (permission === 'default') {
            console.log('我漏掉了网站通知权限操作');
          } else if (permission === 'granted') {
            console.log('允许网站通知');
            const noti = new Notification(title, {
              body,
              icon: localIcon,
            });
            console.log(noti && noti.body);
          }
        });
      }

      return state;
    },
  },
};
