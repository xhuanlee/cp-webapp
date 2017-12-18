import React, { Component } from 'react';
import { Row, Col } from 'antd';
import styles from './AboutPage.less';

const FrontPageFooter = (
  <footer>
    <p style={{ textAlign: 'center' }}>重新发明固定电话</p>
    <a href="http://www.allcomchina.com" target="_blank" rel="noopener noreferrer">
      <p style={{ textAlign: 'center' }} >上海傲通网络科技有限公司</p>
      <p style={{ textAlign: 'center' }} >&copy; 2017</p>
    </a>
  </footer>
);

export default class AboutPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'aboutcallpass',
    };
  }
  renderMenu() {
    return (
      <ul className={styles.nav}>
        <li className="active">
          <a onClick={() => this.setState({ show: 'aboutcallpass' })}>CALLPASS</a>
        </li>
        <li className="active">
          <a onClick={() => this.setState({ show: 'introduce' })}>电话的意义</a>
        </li>
        <li><a onClick={() => this.setState({ show: 'pbx' })}>IPPBX的优势</a></li>
        <li><a onClick={() => this.setState({ show: 'callpass' })}>CALLPASS的优势</a></li>
        <li><a onClick={() => this.setState({ show: 'faq' })}>常见问题</a></li>
      </ul>
    );
  }
  renderContent(key) {
    switch (key) {
      case 'aboutcallpass':
        return (
          <div className={styles.jumbotron}>
            <div className={styles.container}>
              <h2 style={{ textAlign: 'left' }}>什么是CALLPASS？</h2>
              <p style={{
                textAlign: 'left',
                marginTop: 10,
              }}
              >
                CALLPASS 是集成了公司电话功能的即时通讯软件，通过CALLPASS可以更好地使用公司电话。
                它由WEB和手机APP以及后台软交换组成，它可以大大提升现有固定电话和集团电话的使用效率和体验。
              </p>
              <h4 style={{ textAlign: 'left', marginTop: 10 }}>1.WEB客户端</h4>
              <p style={{ textAlign: 'left' }}>
                来电通知，通话记录、录音查询：每个分机有个对应的账号，在电脑上用Chrome浏览器登录后就可以显示来电信息，查询通话记录。一般与电脑边上的固定话机一起使用。
              </p>
              <h4 style={{ textAlign: 'left' }}>2. 手机APP</h4>
              <p style={{ textAlign: 'left' }}>无论在不在办公室，都可以通过手机APP使用公司电话，移动办公。手机APP可以与办公室电话同振。</p>
              <h4 style={{ textAlign: 'left' }}>3. 后台软交换</h4>
              <p style={{ textAlign: 'left' }}>登录企业总机账号，可以查询了解通话记录和录音，有没有漏接的电话，电话线是否够用这些问题都一目了然。</p>
              <p style={{ textAlign: 'left' }}>实现来电排队、分时段语音菜单等个性化呼叫处理。</p>
              <h4 style={{ textAlign: 'left' }}>4. 开放的接口</h4>
              <p style={{ textAlign: 'left' }}>可以接收来自网页或者APP的呼叫，并且没有线路数量的限制</p>
              <p style={{ textAlign: 'left' }}>与网页访问者通话</p>
              <p style={{ textAlign: 'left' }}>访问者也不用担心泄露手机号码</p>
            </div>
          </div>
        );
      case 'introduce':
        return (
          <div className={styles.jumbotron}>
            <div className={styles.container}>
              <h2 style={{ textAlign: 'left' }}>谁在还在用电话？</h2>
              <p style={{ textAlign: 'left' }}>在微信大行其道的今天，谁还在用电话？</p>
              <p style={{ textAlign: 'left' }}>似乎没有电话的位置了。然而我们发现电话仍然是个人与公司、以及陌生人之间唯一能够进行实时沟通的通讯工具。</p>
              <p style={{ textAlign: 'left' }}>
                对于企业来说，电话的重要程度丝毫不亚于手机对于个人的重要程度，公司的电话号码就是公司的手机号码。
                然而今天的手机已经非常智能化了，而大多数公司使用的电话系统还跟以前一样，没有什么变化。办公室的电话机大多数既看不到来电信息，
                也查不了通话记录，更不能像手机那样通过通讯录拨号。这样落后的电话系统既不能让客户满意，也严重影响到公司内部的工作效率和管理水平。
              </p>
              <p style={{ textAlign: 'left' }}>
                解决办法是把电话IP化和智能化，IP化是基础，进而可以让电话机能够借助电脑甚至手机的人机界面获得更多的功能，
                比如前面说的来电弹窗、通话记录、地址本拨号等等，甚至可以收发传真。以前提起IP电话主要是为了省长途通讯费，
                今天我们提IP化主要是为了提升电话的使用体验和效率。
              </p>
              <p style={{ textAlign: 'left' }}>上海傲通基于对于办公电话的理解和认识，重新设计了企业的电话系统。我们的办公电话系统是：</p>
              <p style={{ textAlign: 'left' }}>
                智能的：受限于硬件，办公室电话机缺乏像手机那样的屏幕和智能设备。但是电话边上一般都有电脑，借助于电脑的屏幕、键盘和鼠标以及计算能力，
                固定电话机也可以或者智能手机那样的机器智能。电脑和电话总是如影随形，配合使用，可以完成以下功能：
                来电提醒；
                通话记录查询；
                通讯录查询和编辑；录音；
              </p>
              <p>
                <img src="http://www.gfax.net/images/phone_call.jpg" alt="phone_call" />
              </p>
              <p style={{ textAlign: 'left' }}>移动的：不在办公室的时候可以通过安装的手机APP接听公司来电，也可以用公司电话外呼；</p>
              <p style={{ textAlign: 'left' }}>
                网络的：今天每个公司都有自己的网站、公众号甚至APP。我们可以轻松地帮您在网站上增加一个呼叫按键，
                用户一键呼叫到座机；用户也可以通过callpass.cn网站或者CALLPASS客户端软件给公司座机打电话；
                您的用户不再受地域的局限，从世界上任何一个角落都可以给您免费打电话
              </p>
            </div>
          </div>
        );
      case 'callpass':
        return (
          <div className={styles.jumbotron}>
            <div className={styles.container}>
              <h2 style={{ textAlign: 'left' }}>CALLPASS能带给您什么？</h2>
              <h4 style={{ textAlign: 'left', marginTop: 10 }}>1.友好的用户界面</h4>
              <p style={{ textAlign: 'left' }}>
                一般的电话机都不能像手机那样可以显示来电信息，查询通讯录和通话记录，但您可以用边上的电脑来实现这些功能，
                每个分机有个对应的账号，在电脑上登录后就可以显示来电信息，查询通话记录。
              </p>
              <h4 style={{ textAlign: 'left' }}>2. 软电话</h4>
              <p style={{ textAlign: 'left' }}>除了可以用座机，还可以用电脑浏览器或者手机APP接听来电</p>
              <h4 style={{ textAlign: 'left' }}>3. 可以接收来自网页或者APP的呼叫</h4>
              <p style={{ textAlign: 'left' }}>没有线路数量的限制</p>
              <p style={{ textAlign: 'left' }}>与网页访问者通话</p>
              <p style={{ textAlign: 'left' }}>访问者也不用担心泄露手机号码</p>
              <h4 style={{ textAlign: 'left' }}>4. 有效管理公司通话</h4>
              <p style={{ textAlign: 'left' }}>登录企业总机账号，可以查询了解通话记录和录音，有没有漏接的电话，电话线是否够用这些问题都一目了然。</p>
              <h4 style={{ textAlign: 'left' }}>5. 开通方便</h4>
              <p style={{ textAlign: 'left' }}>手机座机轻松注册，免费通话</p>
              <p style={{ textAlign: 'left' }}>点击右边客服按钮，直接与我们免费通话</p>
            </div>
          </div>
        );
      case 'faq':
        return (
          <div className={styles.jumbotron}>
            <div className={styles.container}>
              <h2 style={{ textAlign: 'left' }}>常见问题？</h2>
              <h4 style={{ textAlign: 'left', marginTop: 10 }}>1. 需要增加什么硬件设备？</h4>
              <p style={{ textAlign: 'left' }}>需要IP电话网关设备，具体来说接外线需要FXO口的IP电话网关，接电话机需要S口的IP电话网关。</p>
              <h4 style={{ textAlign: 'left' }}>2. CALLPASS是呼叫中心吗？</h4>
              <p style={{ textAlign: 'left' }}>
                呼叫中心一般与CRM紧密结合，其用户只是企业里的一部分员工，她们以电话沟通为主的，或者接听来电（客户），或者拨打营销电话（电话销售）。
                对于大中型企业来说，呼叫中心和集团电话是两套独立使用的系统。CALLPASS属于集团电话的范畴，是企业的基本语言通讯系统。不过有了CALLPASS，两者没必要泾渭分明，
                互不相干了，因为CALLPASS可以方便地进行与CRM的整合，省掉呼叫中心的投资。
              </p>
              <h4 style={{ textAlign: 'left' }}>3. 可以收发传真吗？</h4>
              <p style={{ textAlign: 'left' }}>可以用软件收发传真，每一条外线都可以收发传真。</p>
              <h4 style={{ textAlign: 'left' }}>4. 可以接传真机吗？</h4>
              <p style={{ textAlign: 'left' }}>可以，传真机接在S口的网关上</p>
            </div>
          </div>
        );
      case 'pbx':
        return (
          <div className={styles.jumbotron}>
            <div className={styles.container}>
              <h2 style={{ textAlign: 'left' }}>升级办公室电话</h2>
              <h4 style={{ textAlign: 'left', marginTop: 10 }}>无需单独电话布线 扩容方便</h4>
              <p style={{ textAlign: 'left' }}>
                IP电话系统允许将硬件电话直接连接到标准计算机网络端口，避免了电话系统安装和维护的烦琐布线，从而使你在添加用户/扩容上获得更大的机动性。
                如果您刚搬入办公室，在还未安装电话布线的情况下，只用安装计算机网络就可实现通话。今后无论是增加外线还是座机都很方便
              </p>
              <h4 style={{ textAlign: 'left' }}>可以与企业其他信息系统共享信息</h4>
              <p>传统的PBX是一套独立的系统，无法访问企业的通讯录，PBX产生的通话记录也无法共享给CRM或者办公软件。</p>
            </div>
          </div>
        );
      default:
        return (
          <div className={styles.jumbotron}>
            <div className={styles.container}>
              <h2 style={{ textAlign: 'left' }}>网页电话</h2>
              <p style={{ textAlign: 'left' }}>用座机或者手机APP接听来电</p>
              <p style={{ textAlign: 'left' }}>与网站通话</p>
              <p style={{ textAlign: 'left' }}>与陌生人通话</p>
              <p style={{ textAlign: 'left' }}>没有线路数量的限制</p>
              <p style={{ textAlign: 'left' }}>不用担心泄露您的手机号码</p>
              <p style={{ textAlign: 'left' }}>手机座机轻松注册，免费通话</p>
              <p style={{ textAlign: 'left' }}>点击右边客服按钮，直接与我们免费通话</p>
            </div>
          </div>
        );
    }
  }
  render() {
    const menuCol = { xs: 24, sm: 24, md: 8, lg: 5, xl: 4 };
    const contentCol = { xs: 24, sm: 24, md: 16, lg: 19, xl: 20 };
    return (
      <Row>
        <Col {...menuCol}>
          {this.renderMenu()}
        </Col>
        <Col {...contentCol}>
          {this.renderContent(this.state.show)}
          {/* {FrontPageFooter} */}
        </Col>
      </Row>
    );
  }
}
