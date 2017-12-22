import React, { Component } from 'react';
import { Table, Pagination, Tooltip, Icon, Popover } from 'antd';
import { isNotBlank } from '../../utils/cputils';

const FAIL_CALL_REASON = ['ORIGINATOR_CANCEL', 'USER_NOT_REGISTERED'];

const showTotal = (total, range) => {
  return `共 ${total} 当前 ${range}`;
};

const audioVisibleChange = (visible, uuid) => {
  if (visible) {
    const audioElem = document.getElementById(uuid);
    if (audioElem) {
      audioElem.play();
    }
  } else {
    const audioElem = document.getElementById(uuid);
    if (audioElem) {
      audioElem.pause();
    }
  }
};

class CpCdr extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      pageSize: 10,
      playingAudio: [],
    };

    this.pageChange = this.pageChange.bind(this);
    this.pageSizeChange = this.pageSizeChange.bind(this);
    this.makeCall = this.makeCall.bind(this);
    this.audioPlaying = this.audioPlaying.bind(this);
    this.audioPause = this.audioPause.bind(this);
    this.resumePlayingAudio = this.resumePlayingAudio.bind(this);
  }

  pageChange(page, pageSize) {
    this.resumePlayingAudio();
    this.setState({ page, pageSize });
    this.props.fetchCpCdr(page, pageSize);
  }

  pageSizeChange(current, pageSize) {
    this.setState({ pageSize });
    this.props.fetchCpCdr(current, pageSize);
  }

  makeCall(dist) {
    this.props.makeCall(dist);
  }

  resumePlayingAudio() {
    // 重置正在播放的语音记录（改变每页大小时不知如何处理）
    this.setState({ playingAudio: [] });
  }

  audioPlaying(uuid) {
    let { playingAudio } = this.state;
    if (!playingAudio) {
      playingAudio = [];
    }

    playingAudio.push(uuid);
    this.setState({ playingAudio });
  }

  audioPause(uuid) {
    const { playingAudio } = this.state;
    if (playingAudio && playingAudio.length > 0) {
      const newArr = playingAudio.filter((item) => {
        return item !== uuid;
      });

      this.setState({ playingAudio: newArr });
    }
  }

  render() {
    const columns = [
      {
        key: 'startTime',
        title: '呼叫时间',
        dataIndex: 'startTime',
      },
      {
        key: 'callerNumber',
        title: '主叫',
        dataIndex: 'callerNumber',
        render: (text, record) => {
          const { callerNumber, gwCaller, realCaller } = record;
          let result = callerNumber;
          if (isNotBlank(gwCaller)) {
            result = `${callerNumber}<${gwCaller}>`;
            if (isNotBlank(realCaller)) {
              result = `${realCaller}<${gwCaller}>`;
            }
          } else {
            result = `${callerNumber}`;
            if (isNotBlank(realCaller)) {
              result = `${realCaller}`;
            }
          }

          let toolTip = null;
          const { callFromIp, callFromArea, callFromExplorer, callFromLink } = record;
          if (callFromArea) {
            const title = (
              <ul>
                <li><span>IP: </span><span>{callFromIp}</span></li>
                <li><span>归属地: </span><span>{callFromArea}</span></li>
                <li><span>浏览器: </span><span>{callFromExplorer}</span></li>
                <li><span>链接: </span><span>{callFromLink}</span></li>
              </ul>
            );

            toolTip =
              <Tooltip title={title} placement="top"><Icon style={{ marginLeft: 8 }} type="info-circle-o" /></Tooltip>;
          }
          if (window.globalWebPhoneConf.vertoUser === text) {
            return <span><span>{result}</span>{toolTip}</span>;
          } else {
            return <a title={`点击呼叫${result}`} onClick={() => this.makeCall(text)}>{result}{toolTip}</a>;
          }
        },
      },
      {
        key: 'destNumber',
        title: '被叫',
        dataIndex: 'destNumber',
        render: (text, record) => {
          let { destNumber } = record;
          const { gwCallee, realCallee } = record;
          destNumber = destNumber || '';
          let result = destNumber;
          if (isNotBlank(gwCallee)) {
            result = `${gwCallee}`;
            if (isNotBlank(realCallee) && gwCallee !== realCallee) {
              result = `${gwCallee},${realCallee}`;
            }
          } else {
            result = `${destNumber}`;
            if (isNotBlank(realCallee)) {
              result = `${realCallee}`;
            }
          }

          if (window.globalWebPhoneConf.vertoUser === text) {
            return <span>{result}</span>;
          } else {
            return <a title={`点击呼叫${result}`} onClick={() => this.makeCall(text)}>{result}</a>;
          }
        },
      },
      {
        key: 'billsec',
        title: '通话时间',
        dataIndex: 'billsec',
      },
      {
        key: 'originateDisposition',
        title: '状态',
        dataIndex: 'originateDisposition',
      },
      {
        key: 'record',
        title: '录音',
        dataIndex: 'record',
        render: (text, record) => {
          let recordElement = null;
          const { uuid, billsec, originateDisposition, recordPath } = record;
          const recordExists = !FAIL_CALL_REASON.includes(originateDisposition) &&
            billsec > 0 && recordPath;
          if (recordExists) {
            const popContent = (
              <audio
                id={uuid}
                src={`https://callpass.cn/recordings/${recordPath}`}
                controls
                autoPlay
                onPlaying={() => this.audioPlaying(uuid)}
                onPause={() => this.audioPause(uuid)}
                onEnded={() => this.audioPause(uuid)}
              />);
            const iconStyle = {
              cursor: 'pointer',
              fontSize: '16px',
            };
            let iconType = 'play-circle';
            const { playingAudio } = this.state;
            const playing = document.getElementById(uuid) && !document.getElementById(uuid).paused;
            if (playingAudio && playingAudio.length > 0 && playingAudio.includes(uuid) && playing) {
              iconStyle.color = '#1890ff';
              iconType = 'pause-circle';
            }
            recordElement = (
              <Popover
                content={popContent}
                placement="left"
                trigger="click"
                onVisibleChange={visible => audioVisibleChange(visible, uuid)}
              >
                <Icon style={iconStyle} type={iconType} />
              </Popover>);
          } else {
            recordElement = null;
          }

          return recordElement;
        },
      },
    ];

    const pageStyle = {
      padding: '16px 8px',
      textAlign: 'right',
    };

    return (
      <div>
        <Table
          rowKey={record => record.uuid}
          dataSource={this.props.cpCdr}
          columns={columns}
          pagination={false}
        />
        <div style={pageStyle}>
          <Pagination
            current={this.state.page}
            pageSize={this.state.pageSize}
            onChange={this.pageChange}
            total={this.props.cpCdrTotal}
            pageSizeOptions={['10', '20', '50', '100', '500']}
            showSizeChanger
            onShowSizeChange={this.pageSizeChange}
            showQuickJumper
            showTotal={showTotal}
          />
        </div>
      </div>
    );
  }
}

export default CpCdr;
