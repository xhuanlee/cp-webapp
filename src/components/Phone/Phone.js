import React, { Component } from 'react';
import { Button, Icon } from 'antd';
import { Keypad } from '../../voip/Keypad';

import {
  CALL_STATUS_CALL, CALL_STATUS_TALK,
  SOCKET_STATUS_CONNECTING, SOCKET_STATUS_CONNECTED,
  SOCKET_STATUS_DISCONNECTED, SOCKET_STATUS_USER_CLOSE,
} from '../../utils/webphoneutil';

class Phone extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.dialPress = this.dialPress.bind(this);
    this.dialInputChange = this.dialInputChange.bind(this);
    this.clearInput = this.clearInput.bind(this);
    this.makeCall = this.makeCall.bind(this);
    this.hangupCall = this.hangupCall.bind(this);
    this.loginVerto = this.loginVerto.bind(this);
  }

  dialPress(value) {
    this.props.dialPress(value);
  }

  dialInputChange(e) {
    const { value } = e.target;
    this.props.dialInputChange(value);
  }

  clearInput() {
    this.props.clearInput();
  }

  makeCall() {
    this.props.makeCall();
  }

  hangupCall() {
    this.props.hangupCall();
  }

  loginVerto() {
    this.props.loginVerto();
  }

  render() {
    const dialInputStyle = {
      height: '50px',
      textAlign: 'center',
      width: '100%',
      fontSize: '24px',
      backgroundColor: 'inherit',
      outline: 'none',
      border: 'none',
      padding: '0 16px',
    };
    const phoneStyle = {
      padding: '8px 0px',
      position: 'relative',
    };

    const { socketStatus } = this.props;
    const maskDiaplay = socketStatus === SOCKET_STATUS_CONNECTED ? 'none' : 'block';
    const phoneMaskStyle = {
      position: 'absolute',
      zIndex: '10',
      width: '100%',
      height: '100%',
      display: maskDiaplay,
      top: '0',
      left: '0',
      backgroundColor: '#eeeeee',
      opacity: '0.8',
    };

    const clearStatus = this.props.dialed && this.props.dialed.length > 0 ? 'inline-block' : 'none';
    const clearStyle = {
      position: 'absolute',
      width: '16px',
      height: '16px',
      top: '50%',
      marginTop: '-8px',
      right: '4px',
      cursor: 'pointer',
      display: clearStatus,
    };

    const calleeStatus = this.props.callStatus === CALL_STATUS_CALL || this.props.callStatus === CALL_STATUS_TALK ? 'block' : 'none';
    const calleeStyle = {
      textAlign: 'center',
      display: calleeStatus,
    };

    const callTimeStatus = this.props.callStatus === CALL_STATUS_TALK ? 'block' : 'none';
    const callTimeStyle = {
      textAlign: 'center',
      display: callTimeStatus,
    };

    const makeCallStatus = (this.props.callStatus === CALL_STATUS_TALK || this.props.callStatus === CALL_STATUS_CALL) ? 'none' : 'block';
    const makeCallStyle = {
      textAlign: 'center',
      display: makeCallStatus,
    };

    const hangupStatus = (this.props.callStatus === CALL_STATUS_TALK || this.props.callStatus === CALL_STATUS_CALL) ? 'block' : 'none';
    const hangupStyle = {
      textAlign: 'center',
      display: hangupStatus,
    };

    const disconnectDisplay = socketStatus === SOCKET_STATUS_DISCONNECTED ? 'block' : 'none';
    const disconnectStyle = {
      position: 'absolute',
      zIndex: '20',
      width: '100%',
      top: '50%',
      left: '0',
      marginTop: '-10px',
      backgroundColor: '#eeeeee',
      display: disconnectDisplay,
    };

    const connectingDiaplay = socketStatus === SOCKET_STATUS_CONNECTING ? 'block' : 'none';
    const connectingStyle = {
      position: 'absolute',
      zIndex: '20',
      width: '100%',
      top: '50%',
      left: '0',
      marginTop: '-10px',
      backgroundColor: '#eeeeee',
      fontSize: '16px',
      display: connectingDiaplay,
    };

    const closedDisplay = socketStatus === SOCKET_STATUS_USER_CLOSE ? 'block' : 'none';
    const closedStyle = {
      position: 'absolute',
      zIndex: '20',
      width: '100%',
      top: '50%',
      left: '0',
      marginTop: '-10px',
      backgroundColor: '#eeeeee',
      fontSize: '16px',
      display: closedDisplay,
    };

    return (
      <div>
        <div style={phoneStyle}>
          <div style={phoneMaskStyle} />
          <div style={disconnectStyle}>
            <div style={{ textAlign: 'center' }}>
              <span>语音服务连接失败</span>
            </div>
            <div>
              <Button
                style={{ width: '100%' }}
                onClick={this.loginVerto}
              >
                重新连接
              </Button>
            </div>
          </div>
          <div style={connectingStyle}>
            <div style={{ textAlign: 'center' }}>
              <span>正在努力连接...</span>
            </div>
          </div>
          <div style={closedStyle}>
            <div style={{ textAlign: 'center' }}>
              <span>点击下面开关来使用此功能</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              style={dialInputStyle}
              value={this.props.dialed}
              onChange={this.dialInputChange}
            />
            <div title="删除" style={clearStyle}>
              <Icon onClick={this.clearInput} type="close" style={{ width: '16px', height: '16px', color: '#9e9e9e' }} />
            </div>
          </div>
          <div style={calleeStyle}>
            <span>{this.props.callee}</span>
          </div>
          <div style={callTimeStyle}>
            <span>{this.props.callTimeStr}</span>
          </div>
          <div>
            <Keypad keyPressed={this.dialPress} />
          </div>
          <div style={makeCallStyle}>
            <Button
              style={{ backgroundColor: '#3dbd7d', borderColor: '#3dbd7d', width: '60px', height: '60px' }}
              type="primary"
              shape="circle"
              size="large"
              onClick={this.makeCall}
              title="呼叫"
            >
              <Icon type="phone" />
            </Button>
          </div>
          <div style={hangupStyle}>
            <Button
              style={{ backgroundColor: '#f04134', borderColor: '#f04134', width: '60px', height: '60px' }}
              type="primary"
              shape="circle"
              onClick={this.hangupCall}
              title="挂断"
            >
              <Icon type="close-circle" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Phone;
