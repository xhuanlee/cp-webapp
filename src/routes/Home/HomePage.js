/**
 * 主页展示页面
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button } from 'antd';
import ClientCallbtn from '../../components/Home/ClientCallbtn';
import styles from './HomePage.less';

@connect(state => ({
  home: state.home,
}))
export default class HomePage extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.clickLogin = this.clickLogin.bind(this);
    this.clickRegister = this.clickRegister.bind(this);
    this.clickAbout = this.clickAbout.bind(this);
  }

  componentWillMount() {
    // 初始化数据
    console.log('初始化数据');
    this.props.dispatch({ type: 'home/fetchCallBtn', payload: { page: 1, pageSize: 10 } });
  }

  clickLogin() {
    this.props.dispatch(routerRedux.push('/login'));
  }

  clickRegister() {
    this.props.dispatch(routerRedux.push('/register'));
  }

  clickAbout() {
    this.props.dispatch(routerRedux.push('/about'));
  }

  render() {
    const { mainCallBtn, totalCallBtn } = this.props.home;
    console.log(totalCallBtn);
    let clientSection;
    if (mainCallBtn && mainCallBtn.length > 0) {
      clientSection = mainCallBtn.map((item) => {
        return (
          <ClientCallbtn
            key={item.uuid}
            uuid={item.uuid}
            company={item.company}
            website={item.website}
            siteUrl={item.siteUrl}
            servNumber={item.servNumber}
            servName={item.servName}
            logo={item.logo}
          />
        );
      });
    }

    return (
      <main className={styles.main}>
        <div className={styles.top}>
          <div>
            <Button size="large" type="primary" onClick={this.clickLogin} >登录</Button>
          </div>
          <div>
            <Button size="large" onClick={this.clickRegister} >注册</Button>
          </div>
          <div>
            <Button size="large" type="dashed" onClick={this.clickAbout} >关于</Button>
          </div>
        </div>
        <section className={styles.btnSection}>
          {clientSection}
        </section>
        <section className={styles.bottomSection}>
          <div className={styles.appDownloads}>
            <a href="https://itunes.apple.com/us/app/电话帮/id1232104203?ls=1&mt=8" target="_blank" rel="noopener noreferrer">
              <img
                style={{ height: 48 }}
                src="https://gfax.net/images/logo/Apple-Logo-Black.png"
                alt="苹果应用商店手机传真"
                title="苹果应用商店手机传真"
              />
              <span> Apple版下载</span>
            </a>
            <a href="https://gfax.net/download/callpass/app-release.apk" target="_blank" rel="noopener noreferrer">
              <img
                style={{ height: 48 }}
                src="https://gfax.net/images/logo/Android.png"
                alt="本地下载Android版手机传真"
                title="本地下载Android版手机传真"
              />
              <span> Android版下载</span>
            </a>
          </div>
          <div style={{ textAlign: 'center', fontSize: '16px' }}>
            <span>互联网上的电话应用</span>
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px' }}>
            <a href="http://www.allcomchina.com" target="_blank" rel="noopener noreferrer">上海傲通网络科技有限公司 © 2017</a>
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px' }}>
            <a href="http://www.miitbeian.gov.cn" target="_blank" rel="noopener noreferrer">沪ICP备14021271号</a>
          </div>
        </section>
      </main>
    );
  }
}
