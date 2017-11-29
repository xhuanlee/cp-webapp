import React from 'react';
import { Spin } from 'antd';

const GroupSipDetail = ({ loading, status, sipDetail }) => {
  const { cpGroupGatewayDevice, sipRegistration, members } = sipDetail || {}
  let deviceComponent = null;
  if (cpGroupGatewayDevice) {
    const { deviceName, deviceType, fxoCount, fxsCount } = cpGroupGatewayDevice;
    deviceComponent = (
      <ul>
        <li><span>名称：</span><span>{deviceName}</span></li>
        <li><span>型号：</span><span>{deviceType}</span></li>
        <li><span>外线：</span><span>{fxoCount}</span></li>
        <li><span>内线：</span><span>{fxsCount}</span></li>
      </ul>
    );
  }
  let statusComponent = null;
  if (sipRegistration) {
    const { agent, pingStatus, networkIp, networkPort } = sipRegistration;
    statusComponent = (
      <ul>
        <li><span>IP：</span><span>{networkIp}</span></li>
        <li><span>端口：</span><span>{networkPort}</span></li>
        <li><span>设备：</span><span>{agent}</span></li>
        <li><span>网络：</span><span>{pingStatus}</span></li>
      </ul>
    );
  }
  let memberComponent = null;
  if (members && members.length > 0) {
    const listCom = members.map((member) => {
      const { email, memberUuid, ownerType } = member;
      return (
        <li key={memberUuid}>{email}-{ownerType}</li>
      );
    });
    memberComponent = <ul>{listCom}</ul>;
  }
  return (
    <div>
      <div>Detail Header {status}</div>
      <Spin spinning={loading}>
        <div>
          <div>
            <h3>设备</h3>
            <div>{deviceComponent}</div>
          </div>
          <div>
            <h3>状态</h3>
            <div>{statusComponent}</div>
          </div>
          <div>
            <h3>通知</h3>
            <div>
              {memberComponent}
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
}

export default GroupSipDetail;
