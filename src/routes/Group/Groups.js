import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Layout } from 'antd';
import GroupList from '../../components/Group/GroupList';
import GroupSipList from '../../components/Group/GroupSipList';
import GroupSipDetail from '../../components/Group/GroupSipDetail';
import styles from './groups.less';
import { FIELD_SIP_PASSWORD, FIELD_SIP_USERNAME, FXS } from '../../constants/GroupConstants';
import { NO, NONE, YES } from '../../constants/AllConstants';

const { Sider, Content } = Layout;

class Groups extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      group: null,
      inputSip: {},
    };
  }
  componentDidMount() {
    this.props.dispatch({ type: 'group/fetchPageGroup', payload: { query: '', page: 1, pageSize: 20 } });
  }
  fetchGroupSip(groupUuid) {
    const { list } = this.props.group;
    if (list && list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        const group = list[i];
        if (groupUuid === group.uuid) {
          const { sammelnummer } = group;
          this.setState({
            group,
            inputSip: {
              groupUuid,
              sammelnummer,
              sipType: !sammelnummer ? 'sammel' : 'fxs',
              needReg: 'yes',
            },
          });
          break;
        }
      }
    } else {
      this.setState({ group: null });
    }
    this.props.dispatch({ type: 'group/fetchGroupSip', payload: { groupUuid } });
  }
  changeInputSip(sip) {
    const inputSip = { ...this.state.inputSip, ...sip };
    this.setState({ inputSip });
  }
  fetchSipDetail(sip) {
    this.props.dispatch({ type: 'group/fetchSipDetail', payload: { sipUsername: sip } });
  }
  addSip() {
    this.props.dispatch({ type: 'group/showAddSipModal' });

    this.props.dispatch({ type: 'group/setAddSipValidate', payload: { field: FIELD_SIP_USERNAME, status: NONE } });
    this.props.dispatch({ type: 'group/setAddSipValidate', payload: { field: FIELD_SIP_PASSWORD, status: NONE } });
  }
  cancelAddSip() {
    this.props.dispatch({ type: 'group/hideAddSipModal' });

    this.props.dispatch({ type: 'group/setAddSipValidate', payload: { field: FIELD_SIP_USERNAME, status: NONE } });
    this.props.dispatch({ type: 'group/setAddSipValidate', payload: { field: FIELD_SIP_PASSWORD, status: NONE } });
  }
  newSip() {
    const { sipType, sammelnummer, username, needReg } = this.state.inputSip;
    let usernameFinal = sipType === FXS ? `${sammelnummer}${username}` : username;
    // 若 username 未输入，则认为 username 为空
    if (!username) {
      usernameFinal = null;
    }
    const needRegVal = needReg ? YES : NO;
    const sip = { ...this.state.inputSip, username: usernameFinal, needReg: needRegVal };
    console.log(sip);
    this.props.dispatch({ type: 'group/newSip', payload: { sip } });
  }
  updateSip(sip) {
    this.props.dispatch({ type: 'group/updateSip', payload: { sip } });
  }
  deleteGroupSip(sipUsername, groupUuid) {
    this.props.dispatch({ type: 'group/deleteGroupSip', payload: { sipUsername, groupUuid } });
  }
  render() {
    const { list, loading, status,
      sipList, sipLoading, sipStatus,
      sipDetailLoading, sipDetailStatus,
      sipDetail, addSipModal, addSipStatus,
      modalConfirmLoading, addSipValidate,
      usernameValidate, passwordValidate, typeValidate } = this.props.group;

    return (
      <Layout className={styles.pageLayout}>
        <Sider className={styles.groupLayout}>
          <GroupList
            list={list}
            loading={loading}
            status={status}
            fetchGroupSip={this.fetchGroupSip.bind(this)}
          />
        </Sider>
        <Content>
          <GroupSipList
            group={this.state.group}
            inputSip={this.state.inputSip}
            usernameValidate={usernameValidate}
            passwordValidate={passwordValidate}
            typeValidate={typeValidate}
            addSipValidate={addSipValidate}
            list={sipList}
            loading={sipLoading}
            status={sipStatus}
            addSipModal={addSipModal}
            addSipStatus={addSipStatus}
            modalConfirmLoading={modalConfirmLoading}
            fetchSipDetail={this.fetchSipDetail.bind(this)}
            addSip={this.addSip.bind(this)}
            cancelAddSip={this.cancelAddSip.bind(this)}
            newSip={this.newSip.bind(this)}
            updateSip={this.updateSip.bind(this)}
            changeInputSip={this.changeInputSip.bind(this)}
            deleteGroupSip={this.deleteGroupSip.bind(this)}
          />
        </Content>
        {/* <Content> */}
          {/* <GroupSipDetail */}
            {/* loading={sipDetailLoading} */}
            {/* status={sipDetailStatus} */}
            {/* sipDetail={sipDetail} */}
          {/* /> */}
        {/* </Content> */}
      </Layout>
    );
  }
}

export default connect(state => ({
  group: state.group,
}))(Groups);
