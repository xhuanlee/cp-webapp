import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Progress, Popover, Input, Button, message } from 'antd';
import md5 from 'md5';
import styles from './Password.less';
import { isNotBlank } from '../../utils/cputils';

const FormItem = Form.Item;
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

@Form.create()
@connect(state => ({
  user: state.user,
}))
export default class Password extends Component {
  state = {
    confirmDirty: false,
    visible: false,
    help: '',
    oldHelp: '',
  };

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

  checkOldPassword = (rule, value, callback) => {
    if (!value) {
      this.setState({ oldHelp: '请输入原密码' });
      callback('error');
    } else {
      const { currentUser } = this.props.user;
      const { password } = currentUser || {};
      const md5Pass = md5(value);
      if (password !== md5Pass) {
        this.setState({ oldHelp: '密码不正确' });
        callback('error');
      } else {
        this.setState({ oldHelp: '' });
        callback();
      }
    }
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

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true },
      (err, values) => {
        if (!err) {
          console.log(values);
          const { currentUser } = this.props.user;
          const { uuid } = currentUser || {};
          if (isNotBlank(uuid)) {
            this.props.dispatch({
              type: 'user/changePassword',
              payload: {
                uuid,
                oldPassword: values.oldPassword,
                newPassword: values.password,
              },
            });
          } else {
            message.warning('信息有误，请刷新后再试');
          }
        }
      }
    );
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
    const { form, user } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div className={styles.main}>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            label="原密码"
            help={this.state.oldHelp}
          >
            {getFieldDecorator('oldPassword', {
              rules: [{
                required: true, message: '请输入原密码！',
              }, {
                validator: this.checkOldPassword,
              }],
            })(
              <Input
                size="large"
                type="password"
                placeholder="请输入原密码"
              />
            )}
          </FormItem>
          <FormItem
            label="新密码"
            help={this.state.help}
          >
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
                  required: true, message: '请输入密码！',
                }, {
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
          <FormItem
            label="确认密码"
          >
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
            <Button size="large" loading={user.passwordLoading} className={styles.submit} type="primary" htmlType="submit">
              确认
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}
