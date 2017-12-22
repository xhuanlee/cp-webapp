import React from 'react';
import queryString from 'query-string';
import { connect } from 'react-redux';
import { Form, Icon, Input, Button, Checkbox, Row, Col, Alert } from 'antd';
import { saveItem, getItem, removeItem } from '../../utils/cputils';

const FormItem = Form.Item;

const CALLPASS_USERNAME = 'callpass_username';
const REMEMBER_USERNAME = 'remember_username';

class NormalLoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    // console.log('component will mount');
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
          saveItem(CALLPASS_USERNAME, values.userName);
          saveItem(REMEMBER_USERNAME, true);
        } else {
          removeItem(CALLPASS_USERNAME);
          removeItem(REMEMBER_USERNAME);
        }
        const { userName, password } = values;
        const query = queryString.parse(this.props.location.search);
        const { redirect } = query || {};
        this.props.dispatch({ type: 'login/callpassLogin', payload: { username: userName, password, redirect, group: null } });
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
    const { getFieldDecorator } = this.props.form;
    const { loginError } = this.props;
    let username = getItem(CALLPASS_USERNAME);
    username = username || '';
    let rememberUsername = getItem(REMEMBER_USERNAME);
    rememberUsername = !!rememberUsername && rememberUsername === 'true';
    return (
      <Row
        type="flex"
        align="middle"
        justify="center"
        style={{ paddingTop: '12%' }}
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
  const { loginError } = state.login;
  return {
    loginError,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(NormalLoginForm));
