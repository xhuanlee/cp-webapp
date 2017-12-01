import React, { PureComponent } from 'react';
import { Spin, Icon, Tooltip, Button, Modal, Form, Input, Select, Switch } from 'antd';
import SipStatus from '../Sip/SipStatus';
import CpIcon from '../CpIcon';
import styles from './GroupSipList.less';
import groupStyles from './Group.less';
import { SAMMEL, FXO, FXS } from '../../constants/GroupConstants';
import { ERROR, NONE } from '../../constants/AllConstants';

const FormItem = Form.Item;

const AddSipForm = Form.create({
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields);
  },
})((props) => {
  const { getFieldDecorator } = props.form;
  const { sammelnummer } = props.group;
  const { inputedValues, usernameValidate, passwordValidate, typeValidate } = props;
  // sipType 为 null 时，为默认状态
  const { sipType } = inputedValues || {};
  const sipTypeForm = (
    <Select>
      <Select.Option value={SAMMEL} disabled={!!sammelnummer}>总机</Select.Option>
      <Select.Option value={FXO}>外线</Select.Option>
      <Select.Option value={FXS} disabled={!sammelnummer}>分机</Select.Option>
    </Select>
  );
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  };
  return (
    <Form layout="horizontal">
      <FormItem
        {...formItemLayout}
        label="SIP类型"
        hasFeedback={typeValidate && typeValidate.status !== NONE}
        validateStatus={typeValidate && (typeValidate.status === NONE ? '' : typeValidate.status)}
        help={typeValidate && typeValidate.status === ERROR && typeValidate.msg}
      >
        {getFieldDecorator('sipType', {
          rules: [{}],
          initialValue: sammelnummer ? FXS : SAMMEL,
        })(sipTypeForm)}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="SIP账号"
        hasFeedback={usernameValidate && usernameValidate.status !== NONE}
        validateStatus={usernameValidate && (usernameValidate.status === NONE ? '' : usernameValidate.status)}
        help={usernameValidate && usernameValidate.status === ERROR && usernameValidate.msg}
      >
        {getFieldDecorator('username', {
          rules: [{}],
        })(<Input
          addonBefore={((!sipType || (sipType && sipType === FXS)) && sammelnummer) ?
            sammelnummer
            :
            null}
        />)}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="SIP密码"
        hasFeedback={passwordValidate && passwordValidate.status !== NONE}
        validateStatus={passwordValidate && (passwordValidate.status === NONE ? '' : passwordValidate.status)}
        help={passwordValidate && passwordValidate.status === ERROR && passwordValidate.msg}
      >
        {getFieldDecorator('password', {
          rules: [{}],
        })(<Input />)}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="SIP注册"
      >
        {getFieldDecorator('needReg', {
          initialValue: true,
          valuePropName: 'checked',
        })(<Switch checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="cross" />} />)}
        <span className={`ant-form-text ${styles.needRegSpan}`}>是否用于注册SIP服务</span>
      </FormItem>
    </Form>
  );
});

class GroupSipList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedSip: null,
      modalTitle: '添加SIP',
    };

    this.sipClick = this.sipClick.bind(this);
    this.saveForm = this.saveForm.bind(this);
  }
  componentWillMount() {
    const { list } = this.props;
    if (list && list.length > 0) {
      const firstSip = list[0].sipUsername;
      this.sipClick(firstSip);
    }
  }
  addSip() {
    this.setState({ modalTitle: '新增SIP' });
    this.props.addSip();
  }
  sipClick(sip) {
    this.setState({ selectedSip: sip });
    this.props.fetchSipDetail(sip);
  }
  saveSip() {
    this.props.newSip();
    // console.log(this.modalForm);
    // this.props.updateSip();
  }
  handleChange(fields) {
    for (const prop in fields) {
      if (!prop) {
        console.log('no prop');
      }
      const sip = {};
      sip[prop] = fields[prop].value;
      this.props.changeInputSip(sip);
    }
  }
  cancelAddSip() {
    this.props.cancelAddSip(this.modalForm);
  }
  saveForm(form) {
    this.modalForm = form;
  }
  render() {
    const {
      list, status, loading, fetchSipDetail,
      addSipModal, addSipStatus, modalConfirmLoading,
      addSip, cancelAddSip, newSip, updateSip, group,
      changeInputSip, inputSip, addSipValidate,
      usernameValidate, passwordValidate, typeValidate,
      ...restProps } = this.props;
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
      if (sipType === FXO) {
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
            <div><Button shape="circle" icon="plus" size="small" onClick={this.addSip.bind(this)} /></div>
          </div>
        </div>
        <Spin spinning={loading}>
          <div>
            <ul className={styles.sipList}>
              {listComponent}
            </ul>
          </div>
        </Spin>
        <Modal
          onOk={this.saveSip.bind(this)}
          onCancel={this.cancelAddSip.bind(this)}
          okText="保存"
          cancelText="取消"
          confirmLoading={modalConfirmLoading}
          visible={addSipModal}
          title={this.state.modalTitle}
          maskClosable={false}
        >
          <AddSipForm
            ref={this.saveForm}
            inputedValues={inputSip}
            group={group}
            usernameValidate={usernameValidate}
            passwordValidate={passwordValidate}
            typeValidate={typeValidate}
            onChange={this.handleChange.bind(this)}
          />
        </Modal>
      </div>
    );
  }
}

export default GroupSipList;
