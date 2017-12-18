import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Form, Input, Button, Select, Popover, Progress } from 'antd';
import styles from './CpRegister.less';
import { SUCCESS } from '../../constants/AllConstants';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

const passwordStatusMap = {
  ok: <div className={styles.success}>强度：强</div>,
  pass: <div className={styles.warning}>强度：中</div>,
  pool: <div className={styles.error}>强度：太短</div>,
};

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  pool: 'exception',
};

const onFieldsChange = (props, fields) => {
  if (fields.email) {
    props.dispatch({ type: 'register/changeEmailCount', payload: { emailC: 0 } });
  }
  if (fields.phone) {
    props.dispatch({ type: 'register/changePhoneCount', payload: { phoneC: 0 } });
  }
};

@connect(state => ({
  register: state.register,
}))
@Form.create({
  onFieldsChange,
})
export default class Register extends Component {
  state = {
    confirmDirty: false,
    visible: false,
    help: '',
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.register.status === SUCCESS) {
      this.props.dispatch(routerRedux.push('/user/register-result'));
    }
  }

  componentWillUnmount() {
  }

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'pool';
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true },
      (err, values) => {
        if (!err) {
          console.log(values);
          this.props.dispatch({
            type: 'register/submitCp',
            payload: values,
          });
        }
      }
    );
  }

  handleConfirmBlur = (e) => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不匹配!');
    } else {
      callback();
    }
  }

  checkPassword = (rule, value, callback) => {
    if (!value) {
      this.setState({
        help: '请输入密码！',
        visible: !!value,
      });
      callback('error');
    } else {
      this.setState({
        help: '',
      });
      if (!this.state.visible) {
        this.setState({
          visible: !!value,
        });
      }
      if (value.length < 6) {
        callback('error');
      } else {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  }

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ?
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div> : null;
  }

  render() {
    const { form, register } = this.props;
    const { emailC, phoneC } = register;
    const { getFieldDecorator } = form;
    return (
      <div className={styles.main}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem>
            <Popover
              content={
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: 'red' }}>邮箱已使用</span>
                </div>
              }
              placement="right"
              visible={emailC > 0}
            >
              {getFieldDecorator('email', {
                rules: [{
                  required: true, message: '请输入邮箱地址！',
                }, {
                  type: 'email', message: '邮箱地址格式错误！',
                }],
              })(
                <Input size="large" placeholder="邮箱" />
              )}
            </Popover>
          </FormItem>
          <FormItem help={this.state.help}>
            <Popover
              content={
                <div style={{ padding: '4px 0' }}>
                  {passwordStatusMap[this.getPasswordStatus()]}
                  {this.renderPasswordProgress()}
                  <div style={{ marginTop: 10 }}>请至少输入 6 个字符。请不要使用容易被猜到的密码。</div>
                </div>
              }
              overlayStyle={{ width: 240 }}
              placement="right"
              visible={this.state.visible}
            >
              {getFieldDecorator('password', {
                rules: [{
                  validator: this.checkPassword,
                }],
              })(
                <Input
                  size="large"
                  type="password"
                  placeholder="至少6位密码，区分大小写"
                />
              )}
            </Popover>
          </FormItem>
          <FormItem>
            {getFieldDecorator('confirm', {
              rules: [{
                required: true, message: '请确认密码！',
              }, {
                validator: this.checkConfirm,
              }],
            })(
              <Input
                size="large"
                type="password"
                placeholder="确认密码"
              />
            )}
          </FormItem>
          <FormItem>
            <InputGroup size="large" className={styles.mobileGroup} compact>
              <FormItem style={{ width: '20%' }}>
                {getFieldDecorator('prefix', {
                  initialValue: '86',
                })(
                  <Select size="large">
                    <Option value="86">+86</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem style={{ width: '80%' }}>
                <Popover
                  content={
                    <div style={{ padding: '4px 0' }}>
                      <span style={{ color: 'red' }}>手机号码已使用</span>
                    </div>
                  }
                  placement="right"
                  visible={phoneC > 0}
                >
                  {getFieldDecorator('phone', {
                    rules: [{
                      pattern: /^1\d{10}$/, message: '手机号格式错误！',
                    }],
                  })(
                    <Input placeholder="11位手机号" />
                  )}
                </Popover>
              </FormItem>
            </InputGroup>
          </FormItem>
          <FormItem>
            <Button size="large" loading={register.submitting} className={styles.submit} type="primary" htmlType="submit">
              注册
            </Button>
            <Link className={styles.login} to="/login">使用已有账户登录</Link>
          </FormItem>
        </Form>
      </div>
    );
  }
}
