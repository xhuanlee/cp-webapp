import { getIp, getArea, addWbClick, fetchUserByLink, fetchUniqueSite } from '../services/client';
import { SUCCESS } from '../constants/AllConstants';
import { getExplorer } from '../utils/cputils';
import { fetchGroupByUrl } from '../services/notlogin';

// 用户客户端相关数据
export default {
  namespace: 'client',

  state: {
    ip: '',
    area: '',
    explorer: '',
    group: null,
    user: null,
    site: null,
    ipLoading: true,
    groupLoading: true,
    userLoading: true,
    siteLoading: true,
  },

  effects: {
    *fetchClientMsg(_, { call, put }) {
      yield put({ type: 'changeIpLoading', payload: { ipLoading: true } });
      const ipData = yield call(getIp);
      const { ip } = ipData && ipData.data;
      yield put({ type: 'saveIp', payload: { ip } });
      if (ip) {
        const areaData = yield call(getArea, ip);
        if (areaData.RESULT === SUCCESS) {
          const { area } = areaData.DATA.entry;
          yield put({ type: 'saveArea', payload: { area } });
          if (window.globalWebPhoneConf) {
            window.globalWebPhoneConf.callFromArea = area;
          }
        }
      } else {
        console.log('没有获取到客户端 IP.');
      }
      const explorer = getExplorer();
      if (window.globalWebPhoneConf) {
        window.globalWebPhoneConf.callFromIp = ip;
        window.globalWebPhoneConf.callFromExplorer = explorer;
      }
      yield put({ type: 'saveExplorer', payload: { explorer } });
      yield put({ type: 'changeIpLoading', payload: { ipLoading: false } });
    },
    *fetchGroupByUrl({ payload: { cpUrl } }, { call, put }) {
      yield put({ type: 'changeGroupLoading', payload: { groupLoading: true } });
      const data = yield call(fetchGroupByUrl, cpUrl);
      if (data.RESULT === SUCCESS) {
        yield put({ type: 'saveGroup', payload: { group: data.DATA.entry } });
      } else {
        console.log('获取公司信息失败[model/client.js]');
      }
      yield put({ type: 'changeGroupLoading', payload: { groupLoading: false } });
    },
    *fetchUserByLink({ payload: { linkName } }, { call, put }) {
      yield put({ type: 'changeUserLoading', payload: { userLoading: true } });
      const data = yield call(fetchUserByLink, linkName);
      if (data.RESULT === SUCCESS) {
        yield put({ type: 'saveUser', payload: { user: data.DATA.entry } });
      } else {
        console.log('获取用户信息失败[model/client.js]');
      }
      yield put({ type: 'changeUserLoading', payload: { userLoading: false } });
    },
    *fetchUniqueSite({ payload: { uuid } }, { call, put }) {
      yield put({ type: 'changeSiteLoading', payload: { siteLoading: true } });
      const data = yield call(fetchUniqueSite, uuid);
      if (data.RESULT === SUCCESS) {
        yield put({ type: 'saveSite', payload: { site: data.DATA.entry } });
      } else {
        console.log('获取公司信息失败[model/client.js]');
      }
      yield put({ type: 'changeSiteLoading', payload: { siteLoading: false } });
    },
    *addWbClick({ payload: { wbClick } }, { call }) {
      const data = yield call(addWbClick, wbClick);
      if (data.RESULT === SUCCESS) {
        console.log('add a click record');
      } else {
        console.log('add click record fail');
      }
    },
  },

  reducers: {
    saveIp(state, { payload: { ip } }) {
      return { ...state, ip };
    },
    saveArea(state, { payload: { area } }) {
      return { ...state, area };
    },
    saveExplorer(state, { payload: { explorer } }) {
      return { ...state, explorer };
    },
    saveGroup(state, { payload: { group } }) {
      return { ...state, group };
    },
    saveUser(state, { payload: { user } }) {
      return { ...state, user };
    },
    saveSite(state, { payload: { site } }) {
      return { ...state, site };
    },
    changeIpLoading(state, { payload: { ipLoading } }) {
      return { ...state, ipLoading };
    },
    changeGroupLoading(state, { payload: { groupLoading } }) {
      return { ...state, groupLoading };
    },
    changeUserLoading(state, { payload: { userLoading } }) {
      return { ...state, userLoading };
    },
    changeSiteLoading(state, { payload: { siteLoading } }) {
      return { ...state, siteLoading };
    },
  },
};
