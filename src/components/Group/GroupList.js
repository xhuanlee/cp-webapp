import React from 'react';
import { List, Avatar } from 'antd';

const { Item: ListItem } = List;
const { Meta: ItemMeta } = ListItem;

const GroupList = ({ list, loading, ...restProps }) => {
  return (
    <List
      rowKey="uuid"
      loading={loading}
      dataSource={list}
      renderItem={item => (
        <ListItem>
          <ItemMeta
            avatar={<Avatar src={item.logo} />}
            title={item.name}
            description={item.website}
          />
        </ListItem>
      )}
    />
  );
};

export default GroupList;
