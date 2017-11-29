import React, { PureComponent } from 'react';
import { Spin, Icon, Tooltip, Button } from 'antd';
import SipStatus from '../Sip/SipStatus';
import CpIcon from '../CpIcon';
import styles from './GroupSipList.less';
import groupStyles from './Group.less';

class GroupSipList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedSip: null,
    };

    this.sipClick = this.sipClick.bind(this);
  }
  componentWillMount() {
    const { list } = this.props;
    if (list && list.length > 0) {
      const firstSip = list[0].sipUsername;
      this.sipClick(firstSip);
    }
  }
  sipClick(sip) {
    this.setState({ selectedSip: sip });
    this.props.fetchSipDetail(sip);
  }
  render() {
    const { list, status, loading, fetchSipDetail, ...restProps } = this.props;
    const { selectedSip } = this.state;
    const listComponent = list.map((item) => {
      let title = null;
      let icon = null;
      const { sipRegistration: sipStatus, needReg, sipType, username } = item;
      if (!sipStatus) {
        title = needReg === 'yes' ? '离线' : '无需注册';
        icon = needReg === 'yes' ? <Icon className={`${styles.icon} ${styles.sipOfflineIcon}`} type="close-circle" /> : <Icon className={`${styles.icon}`} type="minus-circle" />;
      } else {
        title = <SipStatus sipStatus={sipStatus} />;
        icon = <Icon className={`${styles.icon} ${styles.sipOnlineIcon}`} type="check-circle" />;
      }
      let cpTitle = null;
      let cpIcon = null;
      if (sipType === 'fxo') {
        cpTitle = '外线';
        cpIcon = <CpIcon className={`${styles.icon} ${styles.lineIcon}`} type="icos" />;
      } else {
        cpTitle = '内线';
        cpIcon = <CpIcon className={`${styles.icon} ${styles.phoneIcon}`} type="phone2" />;
      }
      return (
        <li className={styles.sipItem} key={item.username}>
          <Tooltip title={title} placement="right">
            {icon}
          </Tooltip>
          <Tooltip title={cpTitle} placement="right">
            {cpIcon}
          </Tooltip>
          <span
            onClick={() => { this.sipClick(username); }}
            className={`${styles.sipText} ${selectedSip === username ? styles.sipTextSelected : null}`}
          >
            {username}
          </span>
        </li>
      );
    });
    return (
      <div {...restProps}>
        <div className={groupStyles.header}>
          <h2>SIP账号</h2>
          <div className={groupStyles.headerActions}>
            <div><Button shape="circle" icon="plus" size="small" /></div>
          </div>
        </div>
        <Spin spinning={loading}>
          <div>
            <ul className={styles.sipList}>
              {listComponent}
            </ul>
          </div>
        </Spin>
      </div>
    );
  }
}

export default GroupSipList;
