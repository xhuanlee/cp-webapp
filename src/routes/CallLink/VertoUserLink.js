import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Icon, Card } from 'antd';
import { Verto } from '../../verto/js/src/es6/verto';
import { WSS_URL, FS_DOMAIN, WEB_VISIT_EXTEN, WEB_VISIT_PWD } from '../../constants/VertoConfig';
import { INIT_DATA, CALLING, HANGUP, TALKING, WEBCAM } from '../../constants/CallConstants';

let vertoObj = null;
let curCall = null;
let pageReact = null;
let callFromIp = '';
let callFromArea = '';
let callFromExplorer = '';
let callDist = '';

const callbacks = {
  onMessage(verto, dialog, msg, data) {
    switch (msg) {
      case Verto.enum.message.display:
        display('answered the call');
        display(data);
        if (pageReact) {
          pageReact.startTimer();
          pageReact.setState({ callStatus: TALKING });
        }

        break;
      default:
        break;
    }
  },
  onDialogState(d) {
    curCall = d;

    switch (d.state) {
      case Verto.enum.state.ringing:
        display(`Call From: ${d.cidString()}`);
        break;
      case Verto.enum.state.trying:
        display(`Calling: ${d.cidString()}`);
        break;
      case Verto.enum.state.early:
        break;
      case Verto.enum.state.active:
        display(`Talking to: ${d.cidString()}`);
        break;
      case Verto.enum.state.hangup:
        display('hangup the call');
        if (pageReact) {
          pageReact.setState({ callStatus: HANGUP });
          pageReact.endTimer();
        }

        if (curCall.cause === 'Device or Permission Error') {
          alert('没有通话设备');
        }

        // 保存浏览记录（如果呼叫成功，数据库会有 2 条信息）
        if (pageReact) {
          pageReact.saveCallRecord(curCall.cause);
        }
        break;
      case Verto.enum.state.destroy:
        // clearConfMan();
        curCall = null;
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

    curCall = null;
    if (success) {
      display('verto login success');
      if (pageReact) {
        pageReact.setState({ callStatus: CALLING });
      }
      makeCall();
    } else {
      display('verto login fail');
    }
  },
  onWSClose(v, success) {
    display(`wss close ${success}`);
  },
  onEvent(v, e) {
    console.debug('GOT EVENT', e);
  },
};

function display(msg) {
  console.log(msg);
}

function loginVerto() {
  // 登陆 verto
  vertoObj = new Verto({
    login: WEB_VISIT_EXTEN,
    domain: FS_DOMAIN,
    passwd: WEB_VISIT_PWD,
    socketUrl: WSS_URL,
    tag: WEBCAM,
    iceServers: true,
  }, callbacks);
}

function makeCall() {
  if (vertoObj) {
    try {
      curCall = vertoObj.newCall({
        destination_number: callDist,
        caller_id_name: WEB_VISIT_EXTEN,
        caller_id_number: WEB_VISIT_EXTEN,
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
      alert('浏览器不支持');
      if (pageReact) {
        pageReact.setState({ callStatus: HANGUP });
      }
    }
  }
}

const clickSupport = () => {
  window.open('http://www.allcomchina.com');
};

class VertoUserLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeStr: '0:00',
      callTime: 0,
      timer: 0,
      callStatus: INIT_DATA,
      mute: false,
      called: false,
    };
    pageReact = this;

    this.startTimer = this.startTimer.bind(this);
    this.endTimer = this.endTimer.bind(this);
    this.getTimeStr = this.getTimeStr.bind(this);
    this.toggleMute = this.toggleMute.bind(this);
    this.hangupCall = this.hangupCall.bind(this);
  }
  componentWillMount() {
    const { user } = this.props.match.params;
    this.props.dispatch({ type: 'client/fetchUserByLink', payload: { linkName: user } });
  }

  componentWillReceiveProps(nextProps) {
    const userParam = this.props.match.params.user;
    const { user, ipLoading, userLoading } = nextProps.client;
    if (!ipLoading && !userLoading) {
      callFromIp = nextProps.client.ip;
      callFromArea = nextProps.client.area;
      callFromExplorer = nextProps.client.explorer;
      if (user && user.uuid) {
        callDist = user.vertoUsername;
        callDist = callDist || userParam;
      } else {
        callDist = userParam.indexOf('@') > 0 ? userParam : `${user}@gfax.cn`;
      }
      console.log('数据初始化完成');
      // 只进行一次呼叫
      if (!this.state.called) {
        console.log('正在呼叫...');
        this.setState({ called: true });
        this.saveCallRecord();
        loginVerto();
      }
    }
  }

  getTimeStr() {
    const time = this.state.callTime;
    let h = 0;
    let m = 0;
    let s = 0;
    let timeStr = '';
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
      timeStr = `${m}:${s < 10 ? '0' : ''}${s}`;
    } else {
      timeStr = `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }

    this.setState({ timeStr });
  }

  toggleMute() {
    if (curCall && curCall.setMute) {
      curCall.setMute('toggle');
      if (curCall.getMute()) {
        // 正常状态
        this.setState({ mute: false });
      } else {
        // 静音状态
        this.setState({ mute: true });
      }
    }
  }

  hangupCall() {
    if (curCall && curCall.hangup) {
      curCall.hangup();
      this.setState({ callTime: 0 });
    }
  }

  startTimer() {
    this.setState({ callTime: 0 });
    const timer = setInterval(() => {
      let { callTime } = this.state;
      callTime++;
      this.setState({ callTime });
      this.getTimeStr();
    }, 1000);
    this.setState({ timer });
  }

  endTimer() {
    const { timer } = this.state;
    clearInterval(timer);
  }

  saveCallRecord(hangupCause) {
    // 保存访问记录
    const cause = hangupCause || '';
    const paramsObj = {
      siteKey: '',
      caller: WEB_VISIT_EXTEN,
      callee: callDist,
      siteAddr: '',
      callFrom: navigator.userAgent,
      callFromIp: this.props.client.ip,
      callFromArea: this.props.client.area,
      callFromExplorer: this.props.client.explorer,
      callFromLink: location.href,
      hangupCause: cause,
    };
    this.props.dispatch({ type: 'client/addWbClick', payload: { wbClick: paramsObj } });
  }

  render() {
    const member = this.props.client.user;
    const { callStatus } = this.state;
    let linkName = this.props.match.params.user;
    linkName = linkName || '';

    const pageStyle = {
      width: '100vw',
      height: '100vh',
      backgroundColor: '#393D49',
      position: 'relative',
    };
    const headStyle = {
      paddingTop: '60px',
      color: '#fff',
      textAlign: 'center',
    };
    const iconDivStyle = {
      width: '100%',
      position: 'absolute',
      bottom: '60px',
      textAlign: 'center',
    };

    const statusStyle = {
      color: '#fff',
      border: 'none',
      marginTop: '8px',
    };

    let callStatusStr = '';
    switch (callStatus) {
      case INIT_DATA:
        callStatusStr = '初始化...';
        break;
      case CALLING:
        callStatusStr = '正在呼叫...';
        break;
      case TALKING:
        callStatusStr = '正在通话';
        statusStyle.color = '#00C853';
        break;
      case HANGUP:
        callStatusStr = '通话结束';
        statusStyle.color = '#FF5722';
        iconDivStyle.display = 'none';
        break;
      default:
        callStatusStr = '';
        break;
    }

    const defaultImgUrl = `https://timgsa.baidu.com/timg?
    image&quality=80&size=b9999_10000&sec=1508300705350&di=594bb64030e1250c9396b88589850c20&
    imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01b4fe556878220000012716f720f0.jpg`;

    return (
      <div style={pageStyle}>
        <div style={{
          width: '100%',
          position: 'fixed',
          top: '0',
          left: '0',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
        >
          <div>
            <Button
              type="primary"
              onClick={() => {
                this.hangupCall();
                this.props.dispatch(routerRedux.push('/'));
              }}
            >
              <Icon type="home" />主页
            </Button>
          </div>
        </div>
        <div style={{ maxWidth: '500px', margin: 'auto' }}>
          <Card
            hoverable
            cover={
              <img
                src={(member && member.avatar) || defaultImgUrl}
                alt={(member && member.nickName) || linkName}
              />}
          >
            <Card.Meta
              title={(member && member.nickName) || linkName}
              description={(member && member.introduction) || '这个人很懒，什么都没说'}
            />
          </Card>
        </div>
        <div style={headStyle}>
          <div>
            <h1 style={{ color: '#fff', border: 'none' }}>{(member && member.nickName) || linkName}</h1>
            <h4 style={statusStyle}>{callStatusStr}</h4>
          </div>
          <div style={{
            marginTop: '16px',
            display: (callStatus === INIT_DATA || callStatus === CALLING) ? 'none' : 'block',
          }}
          >
            <h1 style={{ color: '#fff', border: 'none' }}>{this.state.timeStr}</h1>
          </div>
        </div>
        <div style={iconDivStyle}>
          <Button
            style={{ marginRight: '20px' }}
            title={this.state.mute ? '取消静音' : '静音'}
            onClick={this.toggleMute}
          >
            {this.state.mute ? <Icon type="sound" /> : <Icon type="sound" />}
          </Button>
          <Button
            style={{ marginLeft: '20px' }}
            title="挂断"
            onClick={this.hangupCall}
          >
            <Icon type="close" />
          </Button>
        </div>
        <div style={{ position: 'absolute', bottom: '10px', width: '100%', textAlign: 'center' }}>
          <a
            onClick={clickSupport}
            href=""
            style={{ fontSize: '10px', color: '#fff' }}
          >
            WEBCALL由上海傲通提供
          </a>
        </div>
        <div id="media" style={{ display: 'none' }}>
          <audio id="webcam" autoPlay></audio>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  client: state.client,
}))(VertoUserLink);
