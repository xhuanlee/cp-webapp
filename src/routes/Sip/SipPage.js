import React, { Component } from 'react';
import { connect } from 'dva';
import { Spin, Tabs } from 'antd';
import GroupSip from '../../components/Sip/GroupSip';
import GroupDevice from '../../components/Sip/GroupDevice';

const { TabPane } = Tabs;

class SipPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.fetchGroupSip = this.fetchGroupSip.bind(this);
    this.fetchGroupDevice = this.fetchGroupDevice.bind(this);
    this.tabClick = this.tabClick.bind(this);
  }

  componentWillMount() {
    // fetch data
    this.fetchGroupSip();
    this.fetchGroupDevice();
  }

  fetchGroupSip() {
    const { callpassUser } = this.props;
    const { groupUuid } = callpassUser;

    this.props.dispatch({ type: 'sip/fetchGroupSip', payload: { groupUuid } });
  }

  fetchGroupDevice() {
    const { callpassUser } = this.props;
    const { groupUuid } = callpassUser;

    this.props.dispatch({ type: 'sip/fetchGroupDevice', payload: { groupUuid } });
  }

  tabClick(tabKey) {
    if (tabKey === 'groupSip') {
      this.fetchGroupSip();
    }

    if (tabKey === 'groupDevice') {
      this.fetchGroupDevice();
    }
  }

  render() {
    return (
      <Spin spinning={this.props.loading} size="large" tip="加载中...">
        <Tabs onTabClick={this.tabClick}>
          <TabPane tab="SIP账号" key="groupSip">
            <GroupSip
              groupSip={this.props.groupSip}
              fetchGroupSip={this.fetchGroupSip}
            />
          </TabPane>
          <TabPane tab="网关设备" key="groupDevice">
            <GroupDevice
              loading={this.props.loading}
              groupDevice={this.props.groupDevice}
              fetchGroupDevice={this.fetchGroupDevice}
            />
          </TabPane>
        </Tabs>
      </Spin>
    );
  }
}

export default connect(state => ({
  callpassUser: state.user.currentUser,
  groupSip: state.sip.groupSip,
  groupDevice: state.sip.groupDevice,
  loading: state.sip.loading,
}))(SipPage);
