import dynamic from 'dva/dynamic';

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => dynamic({
  app,
  models: () => models.map(m => import(`../models/${m}.js`)),
  component,
});

// nav data
export const getNavData = app => [
  {
    component: dynamicWrapper(app, ['user', 'login', 'client'], () => import('../layouts/MainLayout')),
    layout: 'MainLayout',
    name: '首页', // for breadcrumb
    children: [
      {
        name: 'WEB电话',
        icon: 'phone',
        key: 'webphone',
        path: 'main/webphone',
        component: dynamicWrapper(app, ['phone'], () => import('../routes/Phone/WebPhone')),
      },
      {
        name: '传真',
        icon: 'printer',
        path: 'main/fax',
        key: 'fax',
        component: dynamicWrapper(app, ['group'], () => import('../routes/Fax/FaxPage')),
      },
      {
        name: '通话记录',
        icon: 'profile',
        path: 'main/cdr',
        key: 'cdr',
        component: dynamicWrapper(app, ['cdr', 'user'], () => import('../routes/Cdr/CdrPage')),
      },
      {
        name: '电话线路',
        icon: 'bars',
        path: 'main/sip',
        key: 'sip',
        component: dynamicWrapper(app, ['sip', 'user'], () => import('../routes/Sip/SipPage')),
      },
      {
        name: '呼叫按钮',
        icon: 'desktop',
        path: 'main/callbutton',
        key: 'callbutton',
        component: dynamicWrapper(app, ['group'], () => import('../routes/Group/Groups')),
      },
      {
        name: '设置',
        icon: 'setting',
        key: 'setting',
        path: 'main/setting',
        // component: dynamicWrapper(app, ['group'], () => import('../routes/Group/Groups')),
        children: [
          {
            name: '个人信息',
            icon: 'user',
            key: 'userInfo',
            path: 'userInfo',
            component: dynamicWrapper(app, ['group'], () => import('../routes/Setting/UserInfo')),
          },
          {
            name: '修改密码',
            icon: 'lock',
            key: 'password',
            path: 'password',
            component: dynamicWrapper(app, ['group'], () => import('../routes/Setting/Password')),
          },
        ],
      },
      {
        hideMenu: true,
        name: '公司管理',
        icon: 'gongsiguanli',
        path: 'main/group',
        children: [
          {
            name: '所有公司',
            path: 'all',
            component: dynamicWrapper(app, ['group'], () => import('../routes/Group/Groups')),
          },
        ],
      },
    ],
  },
  {
    component: dynamicWrapper(app, [], () => import('../layouts/CpUserLayout')),
    layout: 'CpUserLayout',
    children: [
      {
        hideMenu: true,
        name: '主页',
        path: '/',
        component: dynamicWrapper(app, ['home'], () => import('../routes/Home/HomePage')),
      },
      {
        hideMenu: true,
        name: '关于',
        path: 'about',
        component: dynamicWrapper(app, [], () => import('../routes/Home/AboutPage')),
      },
      {
        hideMenu: true,
        name: '注册',
        path: 'register',
        component: dynamicWrapper(app, ['register'], () => import('../routes/User/CpRegister')),
      },
      {
        hideMenu: true,
        name: '注册结果',
        path: 'register-result',
        component: dynamicWrapper(app, ['register'], () => import('../routes/User/RegisterResult')),
      },
      {
        hideMenu: true,
        name: '登录',
        path: 'login',
        component: dynamicWrapper(app, ['login'], () => import('../routes/User/NormalLoginForm')),
      },
      {
        hideMenu: true,
        name: '公司',
        path: 'e',
        children: [
          {
            name: '登录',
            path: ':group',
            component: dynamicWrapper(app, ['login'], () => import('../routes/User/GroupLoginForm')),
          },
        ],
      },
    ],
  },
  {
    component: dynamicWrapper(app, ['client'], () => import('../layouts/CallLinkLayout')),
    layout: 'CallLinkLayout',
    children: [
      {
        hideMenu: true,
        name: 'BtnCall',
        path: '/btncall',
        component: dynamicWrapper(app, ['client'], () => import('../routes/CallLink/WebcallButton')),
      },
      {
        hideMenu: true,
        name: 'User',
        path: '/u/:user',
        component: dynamicWrapper(app, ['client'], () => import('../routes/CallLink/VertoUserLink')),
      },
      {
        hideMenu: true,
        name: 'Dialplan',
        path: '/d/:dialplan',
        component: dynamicWrapper(app, ['client'], () => import('../routes/CallLink/VertoDialplanLink')),
      },
      {
        hideMenu: true,
        name: 'Group Dialplan',
        path: '/d/:group/:extension',
        component: dynamicWrapper(app, ['client'], () => import('../routes/CallLink/VertoDialplanGroupLink')),
      },
    ],
  },
];
