import React from 'react';
import queryString from 'query-string';
import { connect } from 'dva';
import { Form, Icon, Input, Button, Checkbox, Row, Col, Alert } from 'antd';
import { saveItem, removeItem, getItem } from '../../utils/cputils';

const FormItem = Form.Item;

const REMEMBER_GROUP_USERNAME = 'remember_group_username';
const CALLPASS_GROUP_USERNAME = 'callpass_group_username';

class GroupLoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    // 根据 url 获取公司信息
    const { group } = this.props.match.params;
    this.props.dispatch({ type: 'login/fetchGroupByUrl', payload: { cpUrl: group } });
  }

  componentDidMount() {
    // console.log('component did mount');
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values);
        if (values.remember) {
          saveItem(CALLPASS_GROUP_USERNAME, values.userName);
          saveItem(REMEMBER_GROUP_USERNAME, true);
        } else {
          removeItem(CALLPASS_GROUP_USERNAME);
          removeItem(REMEMBER_GROUP_USERNAME);
        }
        let { userName } = values;
        const { password } = values;
        const { sammelnummer } = this.props.group;
        // 如果是 1-6 位纯数字的话认为是分机号登录，自动在前面加上公司总机
        if (/^(\d{1,6})$/.test(userName)) {
          userName = `${sammelnummer}${userName}`;
        }
        const query = queryString.parse(this.props.location.search);
        const { redirect } = query || {};
        const { group } = this.props.match.params;
        this.props.dispatch({ type: 'login/callpassLogin', payload: { username: userName, password, redirect, group } });
      }
    });
  }

  renderMessage = (message) => {
    return (
      <Alert
        style={{ marginBottom: 24 }}
        message={message}
        type="error"
        showIcon
      />
    );
  }

  render() {
    // console.log('render');
    // console.log(this.props.loginError);
    const { getFieldDecorator } = this.props.form;
    const { loginError, group } = this.props;
    let username = getItem(CALLPASS_GROUP_USERNAME);
    username = username || '';
    let rememberUsername = getItem(REMEMBER_GROUP_USERNAME);
    rememberUsername = !!rememberUsername && rememberUsername === 'true';

    return (
      <Row
        type="flex"
        align="middle"
        justify="center"
        style={{ paddingTop: '10%' }}
      >
        <Col
          xs={20}
          sm={16}
          md={12}
          lg={8}
          xl={8}
        >
          <Form onSubmit={this.handleSubmit} className="login-form">
            {
                group && group.name ?
                    (
                      <div>
                        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                          <img style={{ maxHeight: '120px' }} src={group.logo} alt="LOGO" />
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '14px' }}>
                          <a href={group.website} target="_blank">{group.name}</a>
                        </div>
                        <div style={{ textAlign: 'center', marginBottom: '24px', fontSize: '14px' }}>
                          <a href={`/d/${group.sammelnummer}`} target="_blank">{group.telephone}</a>
                        </div>
                      </div>
                    )
                    :
                    (
                      <div style={{ textAlign: 'center', fontSize: '16px', marginBottom: '8px' }}>
                        <a href="/login">返回个人用户登录</a>
                      </div>
                    )
            }
            {
                  (loginError && loginError.startsWith('error') && this.renderMessage('用户名或密码错误')) ||
                  (loginError && loginError.startsWith('exception') && this.renderMessage('服务器异常，稍后再试')) || null
            }
            <FormItem>
              {getFieldDecorator('userName', {
                rules: [{ required: true, message: '请输入用户名' }],
                initialValue: username,
              })(
                <Input size="large" prefix={<Icon type="user" style={{ fontSize: 16 }} />} placeholder="用户名" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: '请输入登录密码' }],
              })(
                <Input size="large" prefix={<Icon type="lock" style={{ fontSize: 16 }} />} type="password" placeholder="密码" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: rememberUsername,
              })(
                <Checkbox>记住用户名</Checkbox>
              )}
              <a style={{ float: 'right' }} href="">忘记密码</a>
              <Button type="primary" htmlType="submit" style={{ width: '100%', height: 40, fontSize: 16 }} >
                登陆
              </Button>
              <a href="/register">现在注册!</a>
            </FormItem>
          </Form>
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state) {
  const { loginError, group } = state.login;
  return {
    loginError,
    group,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(GroupLoginForm));
