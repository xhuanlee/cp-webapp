import React, { PureComponent } from 'react';
import styles from './index.less';

class CpIcon extends PureComponent {
  render() {
    const { type, className, ...restProps } = this.props;
    const contentStyle = styles[`icon-${type}`];
    return (
      <i {...restProps} className={`anticon ${styles.icon} ${contentStyle} ${className}`} />
    );
  }
}

export default CpIcon;
