import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu, Icon, Avatar, Dropdown, Tag, message, Spin, Modal } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Link, Route, Redirect, Switch, routerRedux } from 'dva/router';
import moment from 'moment';
import SocketClient from 'socket.io-client';
import groupBy from 'lodash/groupBy';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import Debounce from 'lodash-decorators/debounce';
import HeaderSearch from '../components/HeaderSearch';
import NoticeIcon from '../components/NoticeIcon';
import GlobalFooter from '../components/GlobalFooter';
import NotFound from '../routes/Exception/404';
import styles from './MainLayout.less';
import IconType from '../components/CpIcon/IconType';
import CpIcon from '../components/CpIcon';
import { getItem } from '../utils/cputils';
import { ALREADY_LOGIN, GROUP_KEY, TOKEN_KEY, USER_KEY } from '../constants/AllConstants';
import { CALL_STATUS_INIT, CALL_STATUS_RING, initWebPhone } from '../utils/webphoneutil';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

const answerCall = () => {
  if (window.globalWebPhoneConf && window.globalWebPhoneConf.answerCall) {
    window.globalWebPhoneConf.answerCall();
  }
};

const hangupCall = () => {
  if (window.globalWebPhoneConf && window.globalWebPhoneConf.hangupCall) {
    window.globalWebPhoneConf.hangupCall();
  }
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

class MainLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  }
  constructor(props) {
    super(props);
    // 把一级 Layout 的 children 作为菜单项
    this.menus = props.navData.reduce((arr, current) => arr.concat(current.children), []);
    const defaultCallStatus = (window.globalWebPhoneConf && window.globalWebPhoneConf.callStatus) ||
      CALL_STATUS_INIT;
    this.state = {
      openKeys: this.getDefaultCollapsedSubMenus(props),
      callStatus: defaultCallStatus,
      callee: '',
      socketIo: null,
    };

    this.getNavMenuItems = this.getNavMenuItems.bind(this);
  }
  getChildContext() {
    const { location, navData, getRouteData } = this.props;
    const routeData = getRouteData('MainLayout');
    const firstMenuData = navData.reduce((arr, current) => arr.concat(current.children), []);
    const menuData = this.getMenuData(firstMenuData, 'main');
    const breadcrumbNameMap = {};

    routeData.concat(menuData).forEach((item) => {
      breadcrumbNameMap[item.path] = item.name;
    });
    return { location, breadcrumbNameMap };
  }
  componentWillMount() {
    // 初始化数据
    this.props.dispatch({ type: 'client/fetchClientMsg' });

    // 初始化 verto, 重新获取用户信息等
    let { currentUser } = this.props;
    if (!currentUser || !currentUser.uuid) {
      const alreadyLogin = getItem(ALREADY_LOGIN);
      if (alreadyLogin && alreadyLogin === 'true') {
        currentUser = JSON.parse(getItem(USER_KEY));
        // 重新获取公司信息
        const currentGroup = JSON.parse(getItem(GROUP_KEY) || null);
        if (currentGroup) {
          this.props.dispatch({ type: 'user/saveCurrentGroup', payload: { currentGroup } });
          this.props.dispatch({ type: 'user/fetchGroupByUuid', payload: { uuid: currentGroup.uuid } });
        }

        // 连接 socket
        this.connectSocket(currentUser);
        const { uuid } = currentUser;
        this.props.dispatch({ type: 'user/saveCurrentUser', payload: { currentUser } });
        this.props.dispatch({ type: 'user/fetchUserInfo', payload: { uuid } });

        // 更新 token 数据
        const token = getItem(TOKEN_KEY);
        this.props.dispatch({ type: 'user/saveToken', payload: { token } });

        // 获取 fxs, fxo 数据
        // this.props.dispatch({ type: 'user/fetchFxs', payload: { memberUuid: uuid } });
        // this.props.dispatch({ type: 'user/fetchFxo', payload: { memberUuid: uuid } });

        // 已经登陆，则登陆 verto
        initWebPhone(currentUser.vertoUsername, currentUser.vertoPwd, 'webPhoneCam');
      } else {
        this.props.dispatch(routerRedux.push(`/login?redirect=${this.props.location.pathname}`));
      }
    } else {
      // 连接 socket
      this.connectSocket(currentUser);

      // 获取 fxs, fxo 数据
      // this.props.dispatch({ type: 'user/fetchFxs', payload: { memberUuid: uuid } });
      // this.props.dispatch({ type: 'user/fetchFxo', payload: { memberUuid: uuid } });

      // 已经登陆，则登陆 verto
      initWebPhone(currentUser.vertoUsername, currentUser.vertoPwd, 'webPhoneCam');
    }
  }
  componentDidMount() {
    if (window.globalWebPhoneConf) {
      window.globalWebPhoneConf.mainPageReact = this;
    }
    // this.props.dispatch({
    //   type: 'user/fetchCurrent',
    // });
  }
  componentWillUnmount() {
    // 离开当前页面时.
    if (window.globalWebPhoneConf) {
      window.globalWebPhoneConf.mainPageReact = null;
      if (window.globalWebPhoneConf.verto) {
        window.globalWebPhoneConf.verto.logout();
      }
    }

    // 关闭 socket.io 连接
    this.closeSocket();
    this.triggerResizeEvent.cancel();
  }
  onCollapse = (collapsed) => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  }
  onMenuClick = ({ key }) => {
    if (key === 'logout') {
      this.logout();
    }
  }
  getMenuData = (data, parentPath) => {
    let arr = [];
    data.forEach((item) => {
      if (item.children) {
        arr.push({ path: `${parentPath}/${item.path}`, name: item.name });
        arr = arr.concat(this.getMenuData(item.children, `${parentPath}/${item.path}`));
      }
    });
    return arr;
  }
  getDefaultCollapsedSubMenus(props) {
    const currentMenuSelectedKeys = [...this.getCurrentMenuSelectedKeys(props)];
    currentMenuSelectedKeys.splice(-1, 1);
    if (currentMenuSelectedKeys.length === 0) {
      return ['dashboard'];
    }
    return currentMenuSelectedKeys;
  }
  getCurrentMenuSelectedKeys(props) {
    const { location: { pathname } } = props || this.props;
    const keys = pathname.split('/').slice(1);
    if (keys.length === 1 && keys[0] === '') {
      return [this.menus[0].key];
    }
    return keys;
  }
  getNavMenuItems(menusData, parentPath = '') {
    if (!menusData) {
      return [];
    }
    return menusData.map((item) => {
      // 隐藏菜单
      if (item.hideMenu) {
        return null;
      }
      if (!item.name) {
        return null;
      }
      let itemPath;
      if (item.path.indexOf('http') === 0) {
        itemPath = item.path;
      } else {
        // 替换动态路径参数
        const { group } = this.props.match.params;
        let pathName = item.path;
        if (group) {
          pathName = pathName.replace(/:group\?/g, group);
        }
        itemPath = `${parentPath}/${pathName || ''}`.replace(/\/+/g, '/');
      }
      if (item.children && item.children.some(child => child.name)) {
        return (
          <SubMenu
            title={
              item.icon ? (
                <span>
                  { IconType[item.icon] ?
                    <CpIcon type={item.icon} />
                    :
                    <Icon type={item.icon} /> }
                  <span>{item.name}</span>
                </span>
              ) : item.name
            }
            key={item.key || item.path}
          >
            {this.getNavMenuItems(item.children, itemPath)}
          </SubMenu>
        );
      }
      const icon = item.icon && <Icon type={item.icon} />;
      return (
        <Menu.Item key={item.key || item.path}>
          {
            /^https?:\/\//.test(itemPath) ? (
              <a href={itemPath} target={item.target}>
                {icon}<span>{item.name}</span>
              </a>
            ) : (
              <Link
                to={itemPath}
                target={item.target}
                replace={itemPath === this.props.location.pathname}
              >
                {icon}<span>{item.name}</span>
              </Link>
            )
          }
        </Menu.Item>
      );
    });
  }
  getPageTitle() {
    const { location, getRouteData } = this.props;
    const { pathname } = location;
    let title = 'Call Pass';
    getRouteData('MainLayout').forEach((item) => {
      if (item.path === pathname) {
        title = `${item.name} - Call Pass`;
      }
    });
    return title;
  }
  getNoticeData() {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map((notice) => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = ({
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        })[newNotice.status];
        newNotice.extra = <Tag color={color} style={{ marginRight: 0 }}>{newNotice.extra}</Tag>;
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }
  connectSocket(user) {
    const { uuid, email } = user;
    console.log(`之后改成用 uuid 作为 socket 登陆用户名${uuid}`);
    const socketIo = SocketClient('https://callpass.cn', {
      path: '/socket',
      query: {
        exten: email,
      },
    });

    socketIo.on('connect', () => {
      console.log('socket.io connected');

      socketIo.on('income_call', (data) => {
        const { caller, callerName, callee } = data;

        this.props.dispatch({ type: 'phone/notice', payload: { caller, callerName, callee } });
      });

      socketIo.on('disconnect', (reason) => {
        console.log(`socket.io disconnected caused by ${reason}`);
      });

      socketIo.on('error', (error) => {
        console.log(`socket.io error: ${error}`);
      });
    });

    this.setState({ socketIo });
  }
  closeSocket() {
    if (this.state.socketIo) {
      this.state.socketIo.close();
    }
  }
  logout() {
    console.log('logout');
    const { currentGroup: group } = this.state;
    this.props.dispatch({ type: 'login/callpassLogout', payload: { group: group && group.cpUrl } });
  }
  handleOpenChange = (openKeys) => {
    const lastOpenKey = openKeys[openKeys.length - 1];
    const isMainMenu = this.menus.some(
      item => lastOpenKey && (item.key === lastOpenKey || item.path === lastOpenKey)
    );
    this.setState({
      openKeys: isMainMenu ? [lastOpenKey] : [...openKeys],
    });
  }
  toggle = () => {
    const { collapsed } = this.props;
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: !collapsed,
    });
    this.triggerResizeEvent();
  }
  @Debounce(600)
  triggerResizeEvent() { // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }
  handleNoticeClear = (type) => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  }
  handleNoticeVisibleChange = (visible) => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  }
  render() {
    const { currentUser, collapsed, fetchingNotices, getRouteData } = this.props;

    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item disabled><Icon type="user" />个人中心</Menu.Item>
        <Menu.Item disabled><Icon type="setting" />设置</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout"><Icon type="logout" />退出登录</Menu.Item>
      </Menu>
    );
    const noticeData = this.getNoticeData();

    // Don't show popup menu when it is been collapsed
    const menuProps = collapsed ? {} : {
      openKeys: this.state.openKeys,
    };

    const layout = (
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          breakpoint="md"
          onCollapse={this.onCollapse}
          width={256}
          className={styles.sider}
        >
          <div className={styles.logo}>
            <Link to="/">
              <img src="https://callpass.cn/support/image/phone.png" alt="logo" />
              <h1>Call Pass</h1>
            </Link>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            {...menuProps}
            onOpenChange={this.handleOpenChange}
            selectedKeys={this.getCurrentMenuSelectedKeys()}
            style={{ margin: '16px 0', width: '100%' }}
          >
            {this.getNavMenuItems(this.menus)}
          </Menu>
        </Sider>
        <Layout>
          <Header className={styles.header}>
            <Icon
              className={styles.trigger}
              type={collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <div className={styles.right}>
              <HeaderSearch
                className={`${styles.action} ${styles.search}`}
                placeholder="站内搜索"
                dataSource={['搜索提示一', '搜索提示二', '搜索提示三']}
                onSearch={(value) => {
                  console.log('input', value); // eslint-disable-line
                }}
                onPressEnter={(value) => {
                  console.log('enter', value); // eslint-disable-line
                }}
              />
              <NoticeIcon
                className={styles.action}
                count={currentUser.notifyCount}
                onItemClick={(item, tabProps) => {
                  console.log(item, tabProps); // eslint-disable-line
                }}
                onClear={this.handleNoticeClear}
                onPopupVisibleChange={this.handleNoticeVisibleChange}
                loading={fetchingNotices}
                popupAlign={{ offset: [20, -16] }}
              >
                <NoticeIcon.Tab
                  list={noticeData['通知']}
                  title="通知"
                  emptyText="你已查看所有通知"
                  emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
                />
                <NoticeIcon.Tab
                  list={noticeData['消息']}
                  title="消息"
                  emptyText="您已读完所有消息"
                  emptyImage="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
                />
                <NoticeIcon.Tab
                  list={noticeData['待办']}
                  title="待办"
                  emptyText="你已完成所有待办"
                  emptyImage="https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg"
                />
              </NoticeIcon>
              {(currentUser.nickName || currentUser.email) ? (
                <Dropdown overlay={menu}>
                  <span className={`${styles.action} ${styles.account}`}>
                    {
                      currentUser && currentUser.avatar ?
                        <Avatar size="small" className={styles.avatar} src={currentUser.avatar} />
                        :
                        <Avatar size="small" className={styles.avatar} icon="user" />
                    }
                    <span className={styles.avatarText}>
                      {currentUser.nickName || currentUser.email}
                    </span>
                  </span>
                </Dropdown>
              ) : <Spin size="small" style={{ marginLeft: 8 }} />}
            </div>
          </Header>
          <Content style={{ margin: '24px 24px 0', height: '100%' }}>
            <div style={{ minHeight: 'calc(100vh - 260px)' }}>
              <Switch>
                {
                  getRouteData('MainLayout').map(item =>
                    (
                      <Route
                        exact={item.exact}
                        key={item.path}
                        path={item.path}
                        component={item.component}
                      />
                    )
                  )
                }
                <Redirect exact from="/" to="/dashboard/analysis" />
                <Route component={NotFound} />
              </Switch>
            </div>
            <GlobalFooter
              links={[{
                title: '官网',
                href: 'http://www.allcomchina.com',
                blankTarget: true,
              }]}
              copyright={
                <div>
                  Copyright <Icon type="copyright" /> 2017 上海傲通网络科技有限公司
                </div>
              }
            />
          </Content>
        </Layout>
      </Layout>
    );

    const { callStatus } = this.state;
    const answerVisible = callStatus === CALL_STATUS_RING;
    const modal = (
      <Modal
        style={{ bottom: 10, right: 10 }}
        onOk={answerCall}
        width={320}
        onCancel={hangupCall}
        okText="接听"
        cancelText="挂断"
        visible={answerVisible}
        maskClosable={false}
        closable={false}
      >
        {this.state.callee}
      </Modal>
    );

    const mediaDiv = (
      <div style={{ display: 'none' }}>
        <video id="webPhoneCam" autoPlay />
        <audio id="bellRingAudio" autoPlay />
      </div>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => (
            <div className={classNames(params)}>
              {layout}
              {modal}
              {mediaDiv}
            </div>
          )}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

export default connect(state => ({
  currentUser: state.user.currentUser,
  currentGroup: state.user.currentGroup,
  collapsed: state.global.collapsed,
  fetchingNotices: state.global.fetchingNotices,
  notices: state.global.notices,
}))(MainLayout);
