import { getItem } from './cputils';
import { LOGIN_VERTO_CHECKED } from '../constants/AllConstants';
import { Verto } from '../verto/js/src/es6/verto';
import { WSS_URL, FS_DOMAIN } from '../constants/VertoConfig';

export const CALL_STATUS_INIT = 'call_status_init';
export const CALL_STATUS_CALL = 'call_status_call';
export const CALL_STATUS_RING = 'call_status_ring';
export const CALL_STATUS_TALK = 'call_status_talk';
export const CALL_STATUS_HANGUP = 'call_status_hangup';

export const SOCKET_STATUS_USER_CLOSE = 'socket_status_user_close';
export const SOCKET_STATUS_CONNECTING = 'socket_status_connecting';
export const SOCKET_STATUS_CONNECTED = 'socket_status_connected';
export const SOCKET_STATUS_DISCONNECTED = 'socket_status_disconnected';

export const WEB_PHONE_CALL_LOG = 'web_phone_call_log';

function display(msg) {
  console.log(msg);
}

function setCallStatus(status) {
  if (window.globalWebPhoneConf) {
    window.globalWebPhoneConf.callStatus = status;
    if (window.globalWebPhoneConf.webPhoneReact) {
      window.globalWebPhoneConf.webPhoneReact.setState({ callStatus: status });
    }
    if (window.globalWebPhoneConf.mainPageReact) {
      window.globalWebPhoneConf.mainPageReact.setState({ callStatus: status });
    }

    switch (status) {
      case CALL_STATUS_HANGUP:
        window.globalWebPhoneConf.currentCallee = null;
        window.globalWebPhoneConf.callTimeStr = null;
        break;
      default:
        break;
    }
  }
}

function setSocketStatus(status) {
  if (window.globalWebPhoneConf) {
    window.globalWebPhoneConf.socketStatus = status;
    if (window.globalWebPhoneConf.webPhoneReact) {
      window.globalWebPhoneConf.webPhoneReact.setState({ socketStatus: status });
    }
  }
}

function getTimeStr(time) {
  let h = 0;
  let m = 0;
  let s = 0;
  if (!time || isNaN(time) || time <= 0) {
    return '0:00';
  }

  if (time < 60) {
    s = time;
  } else if (time < 3600) {
    s = time % 60;
    m = (time - s) / 60;
  } else {
    s = time % 60;
    const ms = (time - s) / 60;
    m = ms % 60;
    h = (ms - m) / 60;
  }

  if (h <= 0) {
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  } else {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
}

// 开始计时
function startTimer() {
  if (window.globalWebPhoneConf) {
    window.globalWebPhoneConf.callTime = 0;
    window.globalWebPhoneConf.timeInterval = setInterval(() => {
      let { callTime } = window.globalWebPhoneConf;
      if (!callTime) {
        callTime = 0;
      }
      callTime++;

      window.globalWebPhoneConf.callTime = callTime;
      if (window.globalWebPhoneConf.webPhoneReact) {
        const callTimeStr = getTimeStr(callTime);
        window.globalWebPhoneConf.callTimeStr = callTimeStr;
        window.globalWebPhoneConf.webPhoneReact.setState({ callTime, callTimeStr });
      }
    }, 1000);
  }
}

// 终止计时
function endTimer() {
  if (window.globalWebPhoneConf && window.globalWebPhoneConf.timeInterval) {
    clearInterval(window.globalWebPhoneConf.timeInterval);
  }
}

function addCallLog(callLog) {
  const logsStr = localStorage.getItem(WEB_PHONE_CALL_LOG);
  let phoneCallLog = JSON.parse(logsStr);
  if (!phoneCallLog) {
    phoneCallLog = {};
  }
  let logs = phoneCallLog[window.globalWebPhoneConf.vertoUser];
  if (!logs || logs.length <= 0) {
    logs = [];
    logs.push(callLog);
  } else {
    logs.unshift(callLog);
  }
  phoneCallLog[window.globalWebPhoneConf.vertoUser] = logs;

  localStorage.setItem(WEB_PHONE_CALL_LOG, JSON.stringify(phoneCallLog));
  if (window.globalWebPhoneConf && window.globalWebPhoneConf.webPhoneReact) {
    window.globalWebPhoneConf.webPhoneReact.setState({ callLog: logs });
  }
}

// 保存本次呼叫到 localStorage, vertoUser 作为 key，呼叫记录数组作为值
function saveCallLog(curCall) {
  if (curCall) {
    const callee = curCall.params.remote_caller_id_number;
    const caller = curCall.params.caller_id_number;
    const { cause } = curCall;
    const date = new Date();
    const direct = callee === caller ? 'in' : 'out';
    const callLog = { caller, callee, cause, date, direct };
    addCallLog(callLog);
  }
}

export function getCallLog() {
  const logsStr = localStorage.getItem(WEB_PHONE_CALL_LOG);
  let phoneCallLog = JSON.parse(logsStr);
  if (!phoneCallLog) {
    phoneCallLog = {};
  }
  const logs = phoneCallLog[window.globalWebPhoneConf.vertoUser];

  return logs;
}

// title 闪烁
function titleBlink() {
  const { defaultTitle } = window.globalWebPhoneConf;
  window.globalWebPhoneConf.titleInterval = setInterval(() => {
    document.title = document.title === defaultTitle ? '新的来电' : defaultTitle;
  }, 500);
}

function stopTitleBlink() {
  clearInterval(window.globalWebPhoneConf.titleInterval);
  document.title = window.globalWebPhoneConf.defaultTitle;
}

function indicateRing() {
  titleBlink();
  const audioElem = document.getElementById('bellRingAudio');
  if (audioElem) {
    audioElem.src = '/audio/bell_ring2.wav';
    // audioElem.play();
    window.globalWebPhoneConf.ringInterval = setInterval(() => {
      audioElem.src = '/audio/bell_ring2.wav';
      // audioElem.play();
    }, 4000);
  }
}

function stopRing() {
  stopTitleBlink();
  clearInterval(window.globalWebPhoneConf.ringInterval);

  const audioElem = document.getElementById('bellRingAudio');
  if (audioElem) {
    const audioPromise = audioElem.play();
    if (audioPromise !== undefined) {
      audioPromise.then(() => {
        audioElem.pause();
      }).catch((error) => {
        console.log(error);
      });
    }
  }
}

const callbacks = {
  onMessage(verto, dialog, msg, data) {
    console.log('receive voice server data');
    console.log(data);
    switch (msg) {
      case Verto.enum.message.display:
        display('answered the call');

        // 接听后停止振铃
        stopRing();
        setCallStatus(CALL_STATUS_TALK);
        startTimer();

        break;
      default:
        break;
    }
  },
  onDialogState(d) {
    window.globalWebPhoneConf.cur_call = d;
    const callerNumber = d.params.caller_id_number;
    // const callerName = d.params.caller_id_name;

    switch (d.state) {
      case Verto.enum.state.ringing:
        display(`Call From: ${d.cidString()}`);
        indicateRing();
        setCallStatus(CALL_STATUS_RING);
        if (window.globalWebPhoneConf && window.globalWebPhoneConf.mainPageReact) {
          window.globalWebPhoneConf.mainPageReact.setState({ callee: d.cidString() });
          window.globalWebPhoneConf.currentCallee = callerNumber;
        }
        break;
      case Verto.enum.state.trying:
        display(`Calling: ${d.cidString()}`);
        setCallStatus(CALL_STATUS_CALL);
        break;
      case Verto.enum.state.early:
        break;
      case Verto.enum.state.active:
        display(`Talking to: ${d.cidString()}`);
        break;
      case Verto.enum.state.hangup:
        display('hangup the call');

        // 挂断后停止振铃
        stopRing();
        setCallStatus(CALL_STATUS_HANGUP);
        endTimer();
        saveCallLog(d);

        if (window.globalWebPhoneConf.cur_call.cause === 'Device or Permission Error') {
          display('没有通话设备');
        }

        break;
      case Verto.enum.state.destroy:
        window.globalWebPhoneConf.cur_call = null;
        setCallStatus(CALL_STATUS_INIT);
        break;
      case Verto.enum.state.held:
        break;
      default:
        display('');
        break;
    }
  },
  onWSLogin(v, success) {
    display('');

    window.globalWebPhoneConf.cur_call = null;
    if (success) {
      display('verto login success');
      setSocketStatus(SOCKET_STATUS_CONNECTED);
    } else {
      display('verto login fail');
      setSocketStatus(SOCKET_STATUS_DISCONNECTED);
    }
  },
  onWSClose(v, success) {
    display(`wss close: ${success}`);
    if (window && window.globalWebPhoneConf && window.globalWebPhoneConf.userCloseSocket) {
      setSocketStatus(SOCKET_STATUS_USER_CLOSE);
    } else {
      setSocketStatus(SOCKET_STATUS_DISCONNECTED);
    }
  },
  onEvent(v, e) {
    console.debug('GOT EVENT', e);
  },
};

function loginVerto() {
  setSocketStatus(SOCKET_STATUS_CONNECTING);
  // 登陆 verto
  const username = window.globalWebPhoneConf && window.globalWebPhoneConf.vertoUser;
  const password = window.globalWebPhoneConf && window.globalWebPhoneConf.vertoPassword;
  const tag = window.globalWebPhoneConf && window.globalWebPhoneConf.vertoTag;
  const socketUrl = window.globalWebPhoneConf && window.globalWebPhoneConf.vertoSocket;
  const domain = window.globalWebPhoneConf && window.globalWebPhoneConf.vertoDomain;
  window.globalWebPhoneConf.verto = new Verto({
    login: username,
    domain,
    passwd: password,
    socketUrl,
    tag,
    iceServers: true,
  }, callbacks);
}

function makeCall(callee) {
  if (window.globalWebPhoneConf && window.globalWebPhoneConf.verto) {
    window.globalWebPhoneConf.currentCallee = callee;
    try {
      const { callFromIp, callFromArea, callFromExplorer } = window.globalWebPhoneConf;
      window.globalWebPhoneConf.cur_call = window.globalWebPhoneConf.verto.newCall({
        destination_number: callee,
        // caller_id_name: `${(window.globalWebPhoneConf && window.globalWebPhoneConf.vertoUser) ||
        // 'callpass_user'}|| ${navigator.userAgent}||${webCallIp}||${webCallArea}||
        // ${webCallExplorer}||${location.href}`,
        caller_id_name: (window.globalWebPhoneConf && window.globalWebPhoneConf.vertoUser) || 'callpass_user',
        caller_id_number: (window.globalWebPhoneConf && window.globalWebPhoneConf.vertoUser) || 'callpass_user',
        useVideo: false,
        useStereo: false,
        userVariables: {
          user_agent: navigator.userAgent,
          call_from_ip: callFromIp,
          call_from_area: callFromArea,
          call_from_link: location.href,
          call_from_explorer: callFromExplorer,
        },
      });
    } catch (e) {
      display(e);
      display('浏览器不支持');
    }
  }
}

function answerCall() {
  if (window.globalWebPhoneConf && window.globalWebPhoneConf.cur_call) {
    window.globalWebPhoneConf.cur_call.answer();
  } else {
    display('there is no call to answer');
  }
}

function hangupCall() {
  if (window.globalWebPhoneConf && window.globalWebPhoneConf.cur_call) {
    window.globalWebPhoneConf.cur_call.hangup();
  } else {
    display('not calling, can not hangup the call');
  }
}

function logoutVerto() {
  if (window.globalWebPhoneConf) {
    if (window.globalWebPhoneConf.cur_call && window.globalWebPhoneConf.cur_call.hangup) {
      display('hangup current call');
      window.globalWebPhoneConf.cur_call.hangup();
    }
    if (window.globalWebPhoneConf.verto && window.globalWebPhoneConf.verto.logout) {
      display('verto logout');
      window.globalWebPhoneConf.verto.logout();
    }
  }
}

function onBeforeUnload(e) {
  if (window.globalWebPhoneConf) {
    if (window.globalWebPhoneConf.cur_call && window.globalWebPhoneConf.cur_call.hangup) {
      e.returnValue = '正在通话，是否离开本页面？';

      return '正在通话，是否离开本页面？';
    }
  }

  logoutVerto();
}

function onUnload() {
  logoutVerto();
}

export function initWebPhone(username, password, tag, socketUrl = WSS_URL, domain = FS_DOMAIN) {
  // 先退出
  logoutVerto();

  window.globalWebPhoneConf = {
    vertoUser: username,
    vertoPassword: password,
    vertoTag: tag,
    vertoSocket: socketUrl,
    vertoDomain: domain,
    verto: null,
    cur_call: null,
    makeCall,
    answerCall,
    hangupCall,
    loginVerto,
    callStatus: CALL_STATUS_INIT,
    socketStatus: SOCKET_STATUS_DISCONNECTED,
    callTime: 0,
    callTimeStr: null,
    currentCallee: null,
    webPhoneReact: null,
    mainPageReact: null,
    ringInterval: 0,
    userCloseSocket: false,
    defaultTitle: 'CallTechnologies',
    titleInterval: 0,
    callFromIp: '',
    callFromArea: '',
    callFromExplorer: '',
  };

  const willLoginVerto = getItem(LOGIN_VERTO_CHECKED);
  if (willLoginVerto && willLoginVerto === 'true') {
    console.log('开启WEB接听电话功能，登陆VERTO。');
    // 登陆 verto
    loginVerto();
  } else {
    console.log('未开启WEB接听电话功能，不登陆VERTO。');
    window.globalWebPhoneConf.userCloseSocket = true;
  }

  // 页面刷新或离开当前页面
  window.onbeforeunload = onBeforeUnload;
  window.onunload = onUnload;
}
