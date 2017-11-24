import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Layout } from 'antd';
import GroupList from '../../components/Group/GroupList';
import styles from './groups.less';

const { Sider } = Layout;

class Groups extends PureComponent {
  componentDidMount() {
    this.props.dispatch({ type: 'group/fetchPageGroup', payload: { query: '', page: 1, pageSize: 20 } });
  }
  render() {
    const { list, loading } = this.props.group;

    return (
      <Layout>
        <Sider className={styles.groupLayout}>
          <GroupList
            list={list}
            loading={loading}
          />
        </Sider>
      </Layout>
    );
  }
}

export default connect(state => ({
  group: state.group,
}))(Groups);
