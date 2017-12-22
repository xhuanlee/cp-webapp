import React, { Component } from 'react';
import { Row, Col, Card, Tooltip, Icon } from 'antd';

const getRegister = (register) => {
  const { sipAuthUser, sipAuthRealm, agent, status,
    networkIp, networkPort, pingStatus } = register;
  const title = (
    <ul>
      <li><span style={{ fontWeight: 'bold' }}>账号信息</span></li>
      <li><span>SIP账号: </span><span>{sipAuthUser}</span></li>
      <li><span>SIP代理: </span><span>{sipAuthRealm}</span></li>
      <li><span style={{ fontWeight: 'bold' }}>设备信息</span></li>
      <li><span>设备: </span><span>{agent}</span></li>
      <li><span>状态: </span><span>{status}</span></li>
      <li><span style={{ fontWeight: 'bold' }}>网络信息</span></li>
      <li><span>IP: </span><span>{networkIp}</span></li>
      <li><span>端口: </span><span>{networkPort}</span></li>
      <li><span>状态: </span><span>{pingStatus}</span></li>
    </ul>
  );

  return title;
};

class GroupDevice extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.getAllCard = this.getAllCard.bind(this);
    this.getCard = this.getCard.bind(this);
  }

  getCard(device) {
    const liStyle = { padding: '4px 0' };
    const spanStyle = { marginLeft: 8 };

    let networkIp = '-';
    let networkFxsPort = '-';
    let networkFxoPort = '-';
    const { directories, gwDevice, uuid } = device;
    let fxoUseCount = 0;
    let fxsUseCount = 0;
    let fxoRegCount = 0;
    let fxsRegCount = 0;
    const { deviceName, fxsCount, fxoCount } = gwDevice ||
    { deviceName: 'unknown', deviceType: 'none', fxoCount: 0, fxsCount: 0 };

    const fxoArr = [];
    const fxsArr = [];
    if (directories && directories.length > 0) {
      for (let i = 0; i < directories.length; i++) {
        const directory = directories[i];
        const { sipType, needReg, sipRegistration, username } = directory;
        networkIp = (sipRegistration && sipRegistration.networkIp) || networkIp;
        if (sipType === 'fxo') {
          let fxo = null;
          fxoUseCount++;
          if (sipRegistration) {
            networkFxoPort = sipRegistration.networkPort;
            fxoRegCount++;
            fxo = (
              <li style={liStyle} key={username}>
                <Tooltip title={getRegister(sipRegistration)}>
                  <Icon style={{ color: '#00a854' }} type="check-circle" />
                </Tooltip>
                <span style={spanStyle}>{username}</span>
              </li>);
          } else {
            fxo = (
              <li style={liStyle} key={username}>
                <Tooltip title="无需注册">
                  <Icon type="minus-circle" />
                </Tooltip>
                <span style={spanStyle}>{username}</span>
              </li>);
            if (needReg && needReg === 'yes') {
              fxo = (
                <li style={liStyle} key={username}>
                  <Tooltip title="离线">
                    <Icon style={{ color: '#f04134' }} type="close-circle" />
                  </Tooltip>
                  <span style={spanStyle}>{username}</span>
                </li>);
            }
          }

          if (fxo) {
            fxoArr.push(fxo);
          }
        } else {
          let fxs = null;
          fxsUseCount++;
          if (sipRegistration) {
            networkFxsPort = sipRegistration.networkPort;
            fxsRegCount++;
            fxs = (
              <li style={liStyle} key={username}>
                <Tooltip title={getRegister(sipRegistration)}>
                  <Icon style={{ color: '#00a854' }} type="check-circle" />
                </Tooltip>
                <span style={spanStyle}>{username}</span>
              </li>);
          } else {
            fxs = (
              <li style={liStyle} key={username}>
                <Tooltip title="无需注册">
                  <Icon type="minus-circle" />
                </Tooltip>
                <span style={spanStyle}>{username}</span>
              </li>);
            if (needReg && needReg === 'yes') {
              fxs = (
                <li style={liStyle} key={username}>
                  <Tooltip title="离线">
                    <Icon style={{ color: '#f04134' }} type="close-circle" />
                  </Tooltip>
                  <span style={spanStyle}>{username}</span>
                </li>);
            }
          }

          if (fxs) {
            fxsArr.push(fxs);
          }
        }
      }
    }

    const colStyle = { padding: 8 };
    const fxoTitleLiStyle = { fontWeight: 'bold' };
    const fxsTitleLiStyle = { fontWeight: 'bold', marginTop: 8 };

    const cardTitle = (
      <div style={{ lineHeight: '24px' }}>
        <h4 style={{ lineHeight: '24px' }}>{deviceName}</h4>
        <p style={{ fontSize: '12px' }}>
          <span>IP: {networkIp}</span>
          <span style={{ padding: '0 4px' }}>FXO端口: {networkFxoPort}</span>
          <span style={{ padding: '0 4px' }}>FXS端口: {networkFxsPort}</span>
        </p>
      </div>);

    return (
      <Col style={colStyle} xs={24} sm={24} md={12} lg={12} xl={8} key={uuid}>
        <Card loading={this.props.loading} title={cardTitle}>
          <ul>
            <li style={fxoTitleLiStyle} title={`共: ${fxoCount};使用: ${fxoUseCount};注册: ${fxoRegCount}`}>
              <span>{`FXO(外线)[${fxoCount}][${fxoRegCount}/${fxoUseCount}]`}</span>
            </li>
            {fxoArr}
            <li style={fxsTitleLiStyle} title={`共: ${fxsCount};使用: ${fxsUseCount};注册: ${fxsRegCount}`}>
              <span>{`FXS(话机)[${fxsCount}][${fxsRegCount}/${fxsUseCount}]`}</span>
            </li>
            {fxsArr}
          </ul>
        </Card>
      </Col>
    );
  }

  getAllCard() {
    const { groupDevice } = this.props;

    let cards = null;
    if (groupDevice && groupDevice.length > 0) {
      cards = groupDevice.map((item) => {
        return this.getCard(item);
      });
    }

    return cards;
  }

  render() {
    return (
      <div style={{ padding: 16 }}>
        <Row type="flex" gutter={16}>
          {this.getAllCard()}
        </Row>
      </div>
    );
  }
}

export default GroupDevice;
