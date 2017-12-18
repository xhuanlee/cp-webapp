import React from 'react';
import PropTypes from 'prop-types';
import { Link, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Icon } from 'antd';
import GlobalFooter from '../components/GlobalFooter';
import styles from './CpUserLayout.less';

const links = [];
// const links = [{
//   title: '帮助',
//   href: '',
// }, {
//   title: '隐私',
//   href: '',
// }, {
//   title: '条款',
//   href: '',
// }];

const copyright = <div>Copyright <Icon type="copyright" /> 2017 上海傲通网络科技有限公司</div>;

class CpUserLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
  }
  getChildContext() {
    const { location } = this.props;
    return { location };
  }
  getPageTitle() {
    const { getRouteData, location } = this.props;
    const { pathname } = location;
    let title = 'Call Pass';
    getRouteData('CpUserLayout').forEach((item) => {
      if (item.path === pathname) {
        title = `${item.name} - Call Pass`;
      }
    });
    return title;
  }
  render() {
    const { getRouteData } = this.props;

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container}>
          {
            getRouteData('CpUserLayout').map(item =>
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
          <GlobalFooter className={styles.footer} links={links} copyright={copyright} />
        </div>
      </DocumentTitle>
    );
  }
}

export default CpUserLayout;
