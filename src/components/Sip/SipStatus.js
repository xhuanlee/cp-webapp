import React from 'react';

const SipStatus = ({ sipStatus }) => {
  const {
    sipAuthUser, sipAuthRealm, agent, status,
    networkIp, networkPort, pingStatus } = sipStatus;
  return (
    <ul>
      <li><span>账号信息</span></li>
      <li><span>SIP账号: </span><span>{sipAuthUser}</span></li>
      <li><span>SIP代理: </span><span>{sipAuthRealm}</span></li>
      <li><span>设备信息</span></li>
      <li><span>设备: </span><span>{agent}</span></li>
      <li><span>状态: </span><span>{status}</span></li>
      <li><span>网络信息</span></li>
      <li><span>IP: </span><span>{networkIp}</span></li>
      <li><span>端口: </span><span>{networkPort}</span></li>
      <li><span>状态: </span><span>{pingStatus}</span></li>
    </ul>
  );
}

export default SipStatus;
