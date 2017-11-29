import React, { PureComponent } from 'react';
import { List, Avatar, Button } from 'antd';
import styles from './GroupList.less';
import groupStyles from './Group.less';

const { Item: ListItem } = List;
const { Meta: ItemMeta } = ListItem;

class GroupList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedUuid: null,
    }

    this.selectGroup = this.selectGroup.bind(this);
  }
  componentWillMount() {
    const { list } = this.props;
    if (list && list.length > 0) {
      const firstUuid = list[0].uuid;
      this.selectGroup(firstUuid);
    }
  }
  selectGroup = (groupUuid) => {
    this.setState({ selectedUuid: groupUuid });
    this.props.fetchGroupSip(groupUuid);
  };

  render() {
    const { list, loading, fetchGroupSip, ...restProps } = this.props;
    const { selectedUuid } = this.state;
    return (
      <div {...restProps}>
        <div className={groupStyles.header}>
          <h2>公司</h2>
          <div className={groupStyles.headerActions}>
            <div><Button shape="circle" icon="plus" size="small" /></div>
          </div>
        </div>
        <List
          rowKey="uuid"
          loading={loading}
          dataSource={list}
          renderItem={item => (
            <ListItem
              className={`${styles.groupItem} ${selectedUuid && selectedUuid === item.uuid ? styles.groupItemSelected : null}`}
              onClick={() => { this.selectGroup(item.uuid); }}
            >
              <ItemMeta
                avatar={<Avatar src={item.logo} />}
                title={item.name}
                description={item.website}
              />
            </ListItem>
          )}
        />
      </div>
    );
  }
}

export default GroupList;
