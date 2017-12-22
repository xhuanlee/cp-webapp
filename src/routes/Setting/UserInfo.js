import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Avatar, Popover, Row, Col, Spin } from 'antd';
import { CALL_LINK_PREFIX } from '../../constants/UserConstants';
import { isNotBlank } from '../../utils/cputils';

const FormItem = Form.Item;
const { TextArea } = Input;
let pageReact = null;

const onFieldsChange = (props, fields) => {
  if (pageReact) {
    if (fields.avatar) {
      pageReact.setState({ avatar: fields.avatar.value });
    }
    if (fields.linkName) {
      pageReact.setState({ linkName: fields.linkName.value });
      props.dispatch({ type: 'user/changeLinkNameChecked', payload: { linkNameChecked: true } });
    }
    if (fields.phone) {
      props.dispatch({ type: 'user/changePhoneChecked', payload: { phoneChecked: true } });
    }
    if (fields.email) {
      props.dispatch({ type: 'user/changeEmailChecked', payload: { emailChecked: true } });
    }
  }
};

@connect(state => ({
  user: state.user,
}))
@Form.create({
  onFieldsChange,
})
export default class UserInfo extends Component {
  state = {
    formLayout: 'horizontal',
    linkName: null,
    avatar: null,
  };

  componentWillMount() {
    pageReact = this;
    const { currentUser } = this.props.user;
    const { uuid } = currentUser || {};
    if (isNotBlank(uuid)) {
      this.props.dispatch({ type: 'user/fetchUserInfo', payload: { uuid } });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true },
      (err, values) => {
        if (!err) {
          this.props.dispatch({
            type: 'user/updateMember',
            payload: { member: values },
          });
        }
      }
    );
  }

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const {
      currentUser, saveUserLoading, emailChecked,
      phoneChecked, linkNameChecked, loading,
    } = this.props.user;
    const { avatar, nickName, email, phone, linkName, introduction } = currentUser || {};
    const { formLayout } = this.state;
    let stateLink = this.state.linkName;
    stateLink = stateLink || linkName;
    let stateAvatar = this.state.avatar;
    stateAvatar = stateAvatar || avatar;
    const formItemLayout = formLayout === 'horizontal' ? {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
    } : null;
    const btnItemLayout = {
      wrapperCol: {
        span: 14,
        offset: 4,
      },
    };
    return (
      <div>
        <Spin spinning={loading} size="large">
          <Form onSubmit={this.handleSubmit} layout={formLayout}>
            <FormItem
              {...formItemLayout}
              label="头像"
            >
              <Row gutter={4}>
                <Col span={16}>
                  {getFieldDecorator('avatar', {
                    initialValue: avatar,
                  })(
                    <Input size="large" placeholder="头像" />
                  )}
                </Col>
                <Col span={8}>
                  {
                    stateAvatar ?
                      <Avatar size="large" shape="square" src={stateAvatar} />
                      :
                      <Avatar size="large" shape="square" icon="user" />
                  }
                </Col>
              </Row>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="昵称"
            >
              {getFieldDecorator('nickName', {
                initialValue: nickName,
                rules: [{
                  required: true, message: '请输入昵称！',
                }],
              })(
                <Input size="large" placeholder="昵称" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="邮箱"
            >
              <Popover
                content={
                  <div style={{ padding: '4px 0' }}>
                    <span style={{ color: 'red' }}>邮箱已使用</span>
                  </div>
                }
                placement="right"
                visible={!emailChecked}
              >
                {getFieldDecorator('email', {
                  initialValue: email,
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
            <FormItem
              {...formItemLayout}
              label="手机"
            >
              <Popover
                content={
                  <div style={{ padding: '4px 0' }}>
                    <span style={{ color: 'red' }}>手机号码已使用</span>
                  </div>
                }
                placement="right"
                visible={!phoneChecked}
              >
                {getFieldDecorator('phone', {
                  initialValue: phone,
                  rules: [{
                    pattern: /^1\d{10}$/, message: '手机号格式错误！',
                  }],
                })(
                  <Input size="large" placeholder="11位手机号" />
                )}
              </Popover>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="呼叫链接"
            >
              <Row gutter={8}>
                <Col span={8}>
                  <Popover
                    content={
                      <div style={{ padding: '4px 0' }}>
                        <span style={{ color: 'red' }}>链接已被使用</span>
                      </div>
                    }
                    placement="right"
                    visible={!linkNameChecked}
                  >
                    {getFieldDecorator('linkName', {
                      initialValue: linkName,
                      rules: [{
                        pattern: /^([a-zA-Z0-9_]+)$/, message: '由字母(a-zA-Z)，数字(0-9)，下划线组成；必须以字母开头，数字或字母结尾',
                      }],
                    })(
                      <Input size="large" placeholder="由字母(a-zA-Z)，数字(0-9)，下划线组成" />
                    )}
                  </Popover>
                </Col>
                <Col span={16}>
                  <a className="ant-form-text" href={`${CALL_LINK_PREFIX}${stateLink}`} target="_blank">{`(${CALL_LINK_PREFIX}${stateLink})`}</a>
                </Col>
              </Row>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="个性签名"
            >
              {getFieldDecorator('introduction', {
                initialValue: introduction,
              })(
                <TextArea autosize={{ minRows: 2, maxRows: 4 }}>
                  {introduction}
                </TextArea>
              )}
            </FormItem>
            <FormItem {...btnItemLayout}>
              <Button type="primary" htmlType="submit" loading={saveUserLoading}>保存</Button>
            </FormItem>
          </Form>
        </Spin>
      </div>
    );
  }
}
