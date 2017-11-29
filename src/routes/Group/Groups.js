import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Layout } from 'antd';
import GroupList from '../../components/Group/GroupList';
import GroupSipList from '../../components/Group/GroupSipList';
import GroupSipDetail from '../../components/Group/GroupSipDetail';
import styles from './groups.less';

const { Sider, Content } = Layout;

class Groups extends PureComponent {
  componentDidMount() {
    this.props.dispatch({ type: 'group/fetchPageGroup', payload: { query: '', page: 1, pageSize: 20 } });
  }
  fetchGroupSip(groupUuid) {
    this.props.dispatch({ type: 'group/fetchGroupSip', payload: { groupUuid } });
  }
  fetchSipDetail(sip) {
    this.props.dispatch({ type: 'group/fetchSipDetail', payload: { sipUsername: sip } });
  }
  render() {
    const { list, loading, status,
      sipList, sipLoading, sipStatus,
      sipDetailLoading, sipDetailStatus, sipDetail } = this.props.group;

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
        <Sider className={styles.sipLayout}>
          <GroupSipList
            list={sipList}
            loading={sipLoading}
            status={sipStatus}
            fetchSipDetail={this.fetchSipDetail.bind(this)}
          />
        </Sider>
        <Content>
          <GroupSipDetail
            loading={sipDetailLoading}
            status={sipDetailStatus}
            sipDetail={sipDetail}
          />
        </Content>
      </Layout>
    );
  }
}

export default connect(state => ({
  group: state.group,
}))(Groups);
