import React, { Component } from 'react';
import { connect } from 'dva';
import { Switch, Avatar, Card } from 'antd';
import queryString from 'query-string';
import {
  CALL_STATUS_CALL, CALL_STATUS_TALK,
  CALL_STATUS_INIT, SOCKET_STATUS_DISCONNECTED,
  SOCKET_STATUS_CONNECTED, SOCKET_STATUS_USER_CLOSE,
  getCallLog,
} from '../../utils/webphoneutil';
import Phone from '../../components/Phone/Phone';
import { getItem, saveItem } from '../../utils/cputils';
import { LOGIN_VERTO_CHECKED } from '../../constants/AllConstants';

class WebPhone extends Component {
  constructor(props) {
    super(props);
    const defaultCallStatus = window.globalWebPhoneConf.callStatus || CALL_STATUS_INIT;
    const defaultSocketStatus = window.globalWebPhoneConf.socketStatus ||
      SOCKET_STATUS_DISCONNECTED;
    const defaultCallee = (window.globalWebPhoneConf && window.globalWebPhoneConf.currentCallee) || '';
    const defaultCallTimeStr = (window.globalWebPhoneConf && window.globalWebPhoneConf.callTimeStr) || '00:00';
    const defaultCallLog = getCallLog();
    this.state = {
      callStatus: defaultCallStatus,
      socketStatus: defaultSocketStatus,
      dialed: defaultCallee,
      callee: defaultCallee,
      callTimeStr: defaultCallTimeStr,
      callLog: defaultCallLog,
    };

    this.dialPress = this.dialPress.bind(this);
    this.dialInputChange = this.dialInputChange.bind(this);
    this.clearInput = this.clearInput.bind(this);
    this.makeCall = this.makeCall.bind(this);
    this.hangupCall = this.hangupCall.bind(this);
    this.loginVerto = this.loginVerto.bind(this);
    this.switchPhoneLogin = this.switchPhoneLogin.bind(this);
  }

  componentWillMount() {
    const willLoginVerto = getItem(LOGIN_VERTO_CHECKED);
    if (!willLoginVerto || willLoginVerto === 'false') {
      // 登陆 verto
      this.setState({ socketStatus: SOCKET_STATUS_USER_CLOSE });
      window.globalWebPhoneConf.userCloseSocket = true;
    }
  }

  componentDidMount() {
    if (window.globalWebPhoneConf) {
      window.globalWebPhoneConf.webPhoneReact = this;
    }

    // 当 url 后面有 call 参数时，自动发起呼叫
    const { call } = queryString.parse(this.props.location.search);
    if (call && call.length > 0) {
      // this.setState({ callee: call });
      this.makeCall(call);
    }
  }

  componentWillUnmount() {
    // 离开当前页面时.
    if (window.globalWebPhoneConf) {
      window.globalWebPhoneConf.webPhoneReact = null;
    }
  }

  onAvatarClick(callee) {
    if (window.globalWebPhoneConf.socketStatus === SOCKET_STATUS_CONNECTED) {
      this.setState({ dialed: callee });
      this.makeCall(callee);
    } else {
      console.log('verto disconnected, can not make a call');
    }
  }

  clearInput() {
    let { dialed } = this.state;
    if (dialed && dialed.length > 0) {
      dialed = dialed.substring(0, dialed.length - 1);
      this.setState({ dialed });
    }
  }

  makeCall(dist) {
    let callee = this.state.dialed;
    if (dist && dist.length > 0) {
      callee = dist;
    }
    if (callee && callee.length > 0) {
      this.setState({ callee });
      if (window.globalWebPhoneConf && window.globalWebPhoneConf.verto) {
        window.globalWebPhoneConf.makeCall(`${callee}`);
        window.globalWebPhoneConf.callStatus = CALL_STATUS_CALL;
      }
    } else {
      console.log('请输入目的号码');
    }
  }

  hangupCall() {
    if (window.globalWebPhoneConf && window.globalWebPhoneConf.hangupCall) {
      window.globalWebPhoneConf.hangupCall();
    }
  }

  loginVerto() {
    if (window.globalWebPhoneConf && window.globalWebPhoneConf.loginVerto) {
      window.globalWebPhoneConf.loginVerto();
    }
  }

  dialInputChange(value) {
    this.setState({ dialed: value });
  }

  dialPress(value) {
    let text = value;
    switch (value) {
      case 10:
        text = '*';
        break;
      case 11:
        text = '#';
        break;
      default:
        break;
    }

    const callStatus = window.globalWebPhoneConf && window.globalWebPhoneConf.callStatus;
    if (callStatus && (callStatus === CALL_STATUS_CALL || callStatus === CALL_STATUS_TALK)) {
      window.globalWebPhoneConf.cur_call.dtmf(`${text}`);
    }
    this.setState({ dialed: `${this.state.dialed}${text}` });
  }

  switchPhoneLogin(checked) {
    if (checked) {
      if (window.globalWebPhoneConf && window.globalWebPhoneConf.loginVerto) {
        window.globalWebPhoneConf.userCloseSocket = false;
        window.globalWebPhoneConf.loginVerto();
        // 记录到 localStorage 中
        saveItem(LOGIN_VERTO_CHECKED, true);
      }
    } else {
      window.globalWebPhoneConf.userCloseSocket = true;
      if (window.globalWebPhoneConf.verto) {
        window.globalWebPhoneConf.verto.logout();
      }
      // 记录到 localStorage 中
      saveItem(LOGIN_VERTO_CHECKED, false);
    }
  }

  render() {
    const pageStyle = {
      padding: '16px',
    };

    let historyList = [{ callee: '8015' }, { callee: '18801912437' }, { callee: 'lixhuan822#63.com' }, { callee: '8809' }, { callee: 'test2@gfax.cn' }];
    historyList = this.state.callLog;

    const historyStyle = {
      display: 'flex',
      justifyContent: 'center',
      padding: '16px',
      flexWrap: 'wrap',
    };
    const avatarStyle = {
      cursor: 'pointer',
      fontSize: '16px',
      overflow: 'hidden',
    };
    let historyCom = '';
    if (historyList && historyList.length > 0) {
      // if (historyList.length > 20) {
      //     historyList = historyList.slice(0, 20);
      // }
      historyCom = historyList.map((item) => {
        return (
          <div
            key={`${item && item.callee}__${Math.random()}`}
            title={item && item.callee}
            style={{ padding: '8px' }}
          >
            <Avatar
              size={60}
              style={avatarStyle}
              onClick={() => this.onAvatarClick(item && item.callee)}
            >
              {item && item.callee}
            </Avatar>
          </div>
        );
      });
    }
    return (
      <div style={pageStyle}>
        <div style={{ width: '320px', margin: 'auto' }}>
          <Card
            bodyStyle={{ padding: '0px' }}
          >
            <Phone
              dialed={this.state.dialed}
              callee={this.state.callee}
              callStatus={this.state.callStatus}
              socketStatus={this.state.socketStatus}
              callTimeStr={this.state.callTimeStr}
              dialPress={this.dialPress}
              dialInputChange={this.dialInputChange}
              clearInput={this.clearInput}
              makeCall={this.makeCall}
              hangupCall={this.hangupCall}
              loginVerto={this.loginVerto}
            />
          </Card>
          <Card
            bodyStyle={{ padding: '0px' }}
          >
            <ul style={{ padding: 8, listStyle: 'none', margin: '0px' }}>
              <li>
                <Switch
                  defaultChecked={!(window.globalWebPhoneConf.userCloseSocket)}
                  onChange={this.switchPhoneLogin}
                  size="large"
                />
                <span style={{ marginLeft: 8, verticalAlign: 'middle' }}>接听电话</span>
              </li>
            </ul>
          </Card>
        </div>
        <div style={historyStyle}>{historyCom}</div>
      </div>
    );
  }
}

export default connect(state => ({
  phone: state.phone,
}))(WebPhone);
