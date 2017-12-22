import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import { Tabs, Spin, Form, Input, DatePicker, Button } from 'antd';
import CpCdr from '../../components/Cdr/CpCdr';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;

const SearchForm = ({ fetchCpCdr, form }) => {
  const submit = (e) => {
    e.preventDefault();
    fetchCpCdr();
  };

  const { getFieldDecorator } = form;
  return (
    <Form layout="inline" onSubmit={submit} style={{ marginBottom: '16px', marginLeft: '8px' }}>
      <FormItem>
        {getFieldDecorator('query', {})(
          <Input placeholder="号码" />
        )}
      </FormItem>
      <FormItem>
        {getFieldDecorator('range', {})(
          <RangePicker
            style={{ marginLeft: '8px' }}
            ranges={{
              今天: [moment().startOf('day'), moment().endOf('day')],
              本月: [moment().startOf('month'), moment().endOf('month')],
            }}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
            format="YYYY-MM-DD HH:mm:ss"
            allowClear
          />
        )}
      </FormItem>
      <FormItem>
        <Button type="primary" htmlType="submit">查找</Button>
      </FormItem>
    </Form>
  );
};

const WrappedSearchForm = Form.create({
  onFieldsChange(props, changedFields) {
    const { query, range } = changedFields;
    if (query) {
      props.setQuery(query.value);
    }
    if (range) {
      const momentRange = range.value;
      if (momentRange && momentRange.length > 0) {
        const startDt = momentRange[0].format('YYYY-MM-DD HH:mm:ss');
        const endDt = momentRange[1].format('YYYY-MM-DD HH:mm:ss');
        props.setRange(startDt, endDt);
      } else {
        props.setRange('', '');
      }
    }
  },
})(SearchForm);

class CdrPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      number: '',
      startDt: '',
      endDt: '',
    };

    this.fetchCpCdr = this.fetchCpCdr.bind(this);
    this.makeCall = this.makeCall.bind(this);
    this.tabClick = this.tabClick.bind(this);
    this.setQuery = this.setQuery.bind(this);
    this.setRange = this.setRange.bind(this);
  }

  componentWillMount() {
    // fetch data
    this.fetchCpCdr(1, 10);
  }

  setQuery(number) {
    this.setState({ number });
  }

  setRange(startDt, endDt) {
    this.setState({ startDt, endDt });
  }

  fetchCpCdr(page = 1, pageSize = 10) {
    const { callpassUser } = this.props;
    const memberUuid = callpassUser.uuid;
    const { number: query, startDt, endDt } = this.state;

    this.props.dispatch({ type: 'cdr/fetchCdrByMember', payload: { memberUuid, page, pageSize, query, startDt, endDt } });
  }

  tabClick(key) {
    if (key === 'cpCdr') {
      this.fetchCpCdr();
    }
  }

  makeCall(dist) {
    this.props.dispatch(routerRedux.push(`/main/webphone?call=${dist}`));
  }

  render() {
    return (
      <Spin spinning={this.props.loading} size="large" tip="加载中...">
        <Tabs onTabClick={this.tabClick}>
          <TabPane tab="通话记录" key="cpCdr">
            <WrappedSearchForm
              fetchCpCdr={this.fetchCpCdr}
              setQuery={this.setQuery}
              setRange={this.setRange}
            />
            <CpCdr
              cpCdr={this.props.cpCdr}
              cpCdrTotal={this.props.cpCdrTotal}
              fetchCpCdr={this.fetchCpCdr}
              makeCall={this.makeCall}
            />
          </TabPane>
        </Tabs>
      </Spin>
    );
  }
}

export default connect(state => ({
  callpassUser: state.user.currentUser,
  cpCdr: state.cdr.list,
  cpCdrTotal: state.cdr.total,
  loading: state.cdr.loading,
}))(CdrPage);
