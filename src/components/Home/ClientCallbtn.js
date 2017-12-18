import React, { Component } from 'react';

export default class ClientCallbtn extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { logo, company, website, siteUrl, servName, uuid } = this.props;
    const url = `https://callpass.cn/btncall?key=${uuid}&from=${location.href}`;
    const conStyle = {
      width: '320px',
      height: '200px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fafbfd',
      margin: '8px',
    }
    const logStyle = {
      width: '100%',
      height: '60px',
      textAlign: 'center',
    }
    const comStyle = {
      textAlign: 'center',
      fontSize: '16px',
      marginTop: '8px',
    }
    const servStyle = {
      textAlign: 'center',
      fontSize: '16px',
    }
    return (
      <div style={conStyle}>
        <div style={{ width: '100%' }}>
          <div style={logStyle}>
            <a href={siteUrl} target="_blank">
              <img style={{ height: '60px' }} src={logo} alt={company} />
            </a>
          </div>
          <div style={comStyle}>
            <a href={website} target="_blank">{company}</a>
          </div>
          <div style={servStyle}>
            <a href={url} target="_blank">{servName}</a>
          </div>
        </div>
      </div>
    );
  }
}
