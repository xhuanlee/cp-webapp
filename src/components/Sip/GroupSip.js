import React, { Component } from 'react';
import { Table, Icon, Tooltip } from 'antd';

class GroupSip extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const columns = [
      {
        key: 'username',
        title: '号码',
        dataIndex: 'username',
      },
      {
        key: 'sipType',
        title: '号码类型',
        dataIndex: 'sipType',
        render(text) {
          let result = '';
          if (text === 'fxs') {
            result = '内线';
          }
          if (text === 'fxo') {
            result = '外线';
          }

          return result;
        },
      },
      {
        key: 'sipRegistration',
        title: '注册状态',
        dataIndex: 'sipRegistration',
        render(register, record) {
          let result = (
            <Tooltip title="离线">
              <Icon style={{ fontSize: '20px', color: '#f04134' }} type="close-circle" />
            </Tooltip>);
          const { needReg } = record;
          if (!needReg || needReg === 'no') {
            result = <Tooltip title="无需注册"><Icon style={{ fontSize: '20px' }} type="minus-circle" /></Tooltip>;
          }
          if (register) {
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
            result = (
              <Tooltip placement="bottom" title={title}>
                <Icon title="在线" style={{ fontSize: '20px', color: '#00a854' }} type="check-circle" />
              </Tooltip>
            );
          }

          return result;
        },
      },
    ];

    return (
      <div>
        <Table
          rowKey={record => record.username}
          dataSource={this.props.groupSip}
          columns={columns}
          pagination={false}
        />
      </div>
    );
  }
}

export default GroupSip;
