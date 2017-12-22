'use strict';

var React = require('react');
import { StackNavigator } from 'react-navigation';

import ReactDOM,{ findDOMNode } from 'react-dom';

import {Verto} from '../js/src/es6/verto';
import { Platform, AppRegistry, Button,Image, StyleSheet, Text,TextInput, View,TouchableHighlight } from 'react-native-web'
import {Alert} from 'react-native-web-extended';

var transform = require('sdp-transform');

var socket={};// = io.connect('http://react-native-webrtc.herokuapp.com',{jsonp: false});


var configuration = {
        iceCandidatePoolSize: 10,
        'iceServers': [
                      {
                       'url': 'turn:gfax.net:3478',
                       'credential': 'allcompass',
                       'username': 'allcom'

                      },
                      {
//                        'url': 'stun:222.46.16.172:5349'
                        'url': 'stun:gfax.net:3478'
                      },
                      // {
                      //   'url': 'turn:gfax.net:3478?transport=udp',
                      //   'credential': 'allcompass',
                      //   'username': 'allcom'
                      // },
                      // {
                      //   'url': 'turn:gfax.net:3478?transport=tcp',
                      //   'credential': 'allcompass',
                      //   'username': 'allcom'
                      // }
                   ]
            };


var pcPeers = {};
var localStream;
var WSsettings_video = false;
var WSsettings_isFront = true;
export function WSVideoSettings(haveVideo,useFront){
  WSsettings_video=haveVideo;
  WSsettings_isFront = useFront=="front";
}

function getLocalStream1(isFront, callback) {
  console.log('getLocalStream');
//  navigator.getUserMedia({
    getUserMedia({
    "audio": true,
    "video": WSsettings_video,
    "videoType": (isFront ? "front" : "back") // optional, values is `back`, `front`
  }, function (stream) {
    callback(stream);
  }, logError);
}
function getLocalStream(isFront, callback) {
  MediaStreamTrack.getSources(sourceInfos => {
    // var videoSourceId;
    // for (var i = 0; i < sourceInfos.length; i++) {
    //   var sourceInfo = sourceInfos[i];
    //   if (sourceInfo.kind == "video" && sourceInfo.facing == "front") {
    //     videoSourceId = sourceInfo.id;
    //   }
    // }
    getUserMedia({
      "audio": true,
      "video": false,//{
//        optional: [{sourceId: videoSourceId}]
//      }
    }, function (stream) {
//    pc.addStream(stream);
      callback(stream);
    }, logError);
  });
}

function join(roomID) {
  // socket.emit('join', roomID, function(socketIds){
  //   console.log('join', socketIds);
  //   for (var i in socketIds) {
  //     var socketId = socketIds[i];
  //     createPC(socketId, true);
  //   }
  // });
//  allcom.sendWebrtcMessage(roomID,"CALL","react-native");
}
export function WSanswerCall(roomID,container){
  getLocalStream(WSsettings_isFront, function(stream) {
    console.log("getLocalStream ");
    localStream = stream;
    if (container==null)
      return;
    container.setState({selfViewSrc: stream.toURL()});
    container.setState({status: 'ready', info: 'Please enter or create room ID'});
    WScreatePC(roomID, false,container);
  });
//  allcom.sendWebrtcMessage(roomID,"ACCEPT","react-native");
}
function docall(callee) {
//    $('#ext').trigger('change');

    if (cur_call) {
        return;
    }

//    $("#main_info").html("Trying");

    cur_call = verto.newCall({
        destination_number: callee,
        caller_id_name: logininfo.username,
        caller_id_number: logininfo.username,
        useVideo: false,
        useStereo: false
    });
}

export function WSmakeCall(roomID,container){
    docall(roomID);
    return;
    busy=false;
  getLocalStream(WSsettings_isFront, function(stream) {
    console.log("getLocalStream ");
    localStream = stream;
    if (container==null)
      return;
    container.setState({selfViewSrc: stream.toURL()});
    container.setState({status: 'ready', info: 'Please enter or create room ID'});
    WScreatePC(roomID, true,container);
  });
//  allcom.sendWebrtcMessage(roomID,"ACCEPT","react-native");
}
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
var sessionid=guid();

var mydesc = null;
var mycandidates=[];
var reconnect=true;
var offerSDP =null;
export function WScreatePC(socketId, isOffer,container) {
  var pc = new RTCPeerConnection(configuration);
//  var pc = new RTCPeerConnection({});
  pcPeers[socketId] = pc;

  reconnect = true;
  pc.onicecandidate = function (event) {
      if (event.candidate) {
//      socket.emit('exchange', {'to': socketId, 'candidate': event.candidate });
//      allcom.sendWebrtcMessage(socketId,"exchange",{'candidate':event.candidate});
//         jrpc.call('candidate', event.candidate).then(function (result) {
//             console.log('candidate:'+result);
//         });
          console.log('onicecandidate', event.candidate);
//          pc.addIceCandidate(event.candidate);
          if (isOffer && event.candidate.sdpMid=='audio'){
             mycandidates.push(event.candidate);
             if (mycandidates.length==2) {
                 if (isOffer)
                     createOffer();
                 else {
                     console.log("should create answer?")
                     createAnswerFinal(true);
                 }
                 return;
             }
            else
              if (callID==null)
                  return;
              let candidates='';
              for (let candidate in mycandidates)
                  candidates+="\na="+mycandidates[candidate].candidate;
              let param1={
                  callID:callID
//                  ,sdp: pc.localDescription.sdp
                  , sdp: pc.localDescription.sdp+candidates
//                  ,sdp: pc.localDescription.sdp+"\na="+event.candidate.candidate
                  ,sessid: sessionid
              };
              console.log("answer:"+JSON.stringify(param1));
              jrpc.call('verto.media', param1).then(function (result) {
                  console.log("send media:"+result);
//                  container.setState({status:'ready'})
                  mycandidates=[];
              });

          }
      }
//      else
      if (event.candidate==null || mycandidates.length==12)
//      if (mycandidates.length>=2)
          {
        console.log('onicecandidate', 'ALL DONE');
//
//        if (mycandidates==null || mycandidates.length==0)
//          if (isOffer && this.localDescription.sdp.indexOf("candidate")==-1)
          if (isOffer)
              createOffer();
          else {
              console.log("should create answer?")
              createAnswerFinal(true);
          }
        return;

      if (isOffer) {
//          pc.setLocalDescription(desc, function () {
              console.log('setLocalDescription', pc.localDescription);
              console.log('setLocalDescription sdp', pc.localDescription.sdp);
//              let callid=guid();
              let candidates='';
              for (let candidate in mycandidates)
                  candidates+="\r\na="+mycandidates[candidate].candidate;
              let param1= {
                  callID:callID
               //    dialogParams: {
               //        callID: callid
               //        , caller_id_name: "1003"
               //        , caller_id_number: "1003"
               //        , destination_number: container.state.roomID
               //        , localTag:null
               //        , login: "1003@"+host
               //        , remote_caller_id_name: container.state.roomID
               //        , remote_caller_id_number: container.state.roomID
               //        , screenShare: false
               //        , tag: "webcam1"
               //        , useMic: "any"
               //        , useSpeak: "any"
               //        , useStereo: false
               //        , useVideo: false
               // , useCamera: "any"
               //   , videoParams: {"minFrameRate": 30, "minWidth": "1280", "minHeight": "720"}
               //    }
                  , sdp: pc.localDescription.sdp+candidates
                  , sessid: sessionid
              };
              jrpc.call('verto.media', param1).then(function (result) {
                  console.log(result);
                  container.setState({status:'ready'})
              });
              //       socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription });
//        allcom.sendWebrtcMessage(socketId,"OFFER",{'sdp':pc.localDescription});
//          {"jsonrpc":"2.0","method":"verto.invite","id":2,"params":{"dialogParams":{"remote_caller_id_number":"1008","useVideo":false,"useMic":"any","useStereo":false,"tag":"webcam","login":"1000@159.203.164.7","useCamera":"any","videoParams":{"minFrameRate":30,"minWidth":"1280","minHeight":"720"},"destination_number":"1008","screenShare":false,"caller_id_name":"FreeSWITCH User","caller_id_number":"1000","callID":"0CD433FC-A909-4DF2-BC46-0A4A94E9B800","remote_caller_id_name":"Outbound Call","useSpeak":"any"},"sessid":"53FB0781-B586-4CDA-98C6-558680663B46","sdp":"v=0\r\no=- 8564086442942257834 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio video\r\na=msid-semantic: WMS\r\nm=audio 58157 UDP\/TLS\/RTP\/SAVPF 111 103 104 9 102 0 8 106 105 13 127 126\r\nc=IN IP4 82.166.93.197\r\na=rtcp:52576 IN IP4 82.166.93.197\r\na=candidate:3168280865 1 udp 2122260223 11.0.0.244 58157 typ host generation 0\r\na=candidate:1260196625 1 udp 2122194687 10.134.172.254 58951 typ host generation 0\r\na=candidate:3168280865 2 udp 2122260222 11.0.0.244 52576 typ host generation 0\r\na=candidate:1260196625 2 udp 2122194686 10.134.172.254 58945 typ host generation 0\r\na=candidate:4066106833 1 tcp 1518280447 11.0.0.244 60562 typ host tcptype passive generation 0\r\na=candidate:94302177 1 tcp 1518214911 10.134.172.254 60563 typ host tcptype passive generation 0\r\na=candidate:4066106833 2 tcp 1518280446 11.0.0.244 60564 typ host tcptype passive generation 0\r\na=candidate:94302177 2 tcp 1518214910 10.134.172.254 60565 typ host tcptype passive generation 0\r\na=candidate:1610196941 1 udp 1686052607 82.166.93.197 58157 typ srflx raddr 11.0.0.244 rport 58157 generation 0\r\na=candidate:1610196941 2 udp 1686052606 82.166.93.197 52576 typ srflx raddr 11.0.0.244 rport 52576 generation 0\r\na=candidate:2274372738 2 udp 1685987070 176.13.15.205 5834 typ srflx raddr 10.134.172.254 rport 58945 generation 0\r\na=candidate:2274372738 1 udp 1685987071 176.13.15.205 5840 typ srflx raddr 10.134.172.254 rport 58951 generation 0\r\na=ice-ufrag:g8lHDtPwH7m5xRex\r\na=ice-pwd:Q6jcBJNTWAyu0JTuIaQAeNI3\r\na=fingerprint:sha-256 0F:A1:68:51:87:3E:B4:C1:0D:33:97:40:78:22:2A:8C:D2:B6:46:23:F5:99:C9:88:5D:34:DB:E2:C5:94:B3:DD\r\na=setup:actpass\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:3 http:\/\/www.webrtc.org\/experiments\/rtp-hdrext\/abs-send-time\r\na=recvonly\r\na=rtcp-mux\r\na=rtpmap:111 opus\/48000\/2\r\na=fmtp:111 minptime=10; useinbandfec=1\r\na=rtpmap:103 ISAC\/16000\r\na=rtpmap:104 ISAC\/32000\r\na=rtpmap:9 G722\/8000\r\na=rtpmap:102 ILBC\/8000\r\na=rtpmap:0 PCMU\/8000\r\na=rtpmap:8 PCMA\/8000\r\na=rtpmap:106 CN\/32000\r\na=rtpmap:105 CN\/16000\r\na=rtpmap:13 CN\/8000\r\na=rtpmap:127 red\/8000\r\na=rtpmap:126 telephone-event\/8000\r\na=maxptime:60\r\nm=video 61966 UDP\/TLS\/RTP\/SAVPF 100 101 116 117 96\r\nc=IN IP4 82.166.93.197\r\na=rtcp:63816 IN IP4 82.166.93.197\r\na=candidate:3168280865 1 udp 2122260223 11.0.0.244 61966 typ host generation 0\r\na=candidate:1260196625 1 udp 2122194687 10.134.172.254 50435 typ host generation 0\r\na=candidate:3168280865 2 udp 2122260222 11.0.0.244 63816 typ host generation 0\r\na=candidate:1260196625 2 udp 2122194686 10.134.172.254 63396 typ host generation 0\r\na=candidate:4066106833 1 tcp 1518280447 11.0.0.244 60566 typ host tcptype passive generation 0\r\na=candidate:94302177 1 tcp 1518214911 10.134.172.254 60567 typ host tcptype passive generation 0\r\na=candidate:4066106833 2 tcp 1518280446 11.0.0.244 60568 typ host tcptype passive generation 0\r\na=candidate:94302177 2 tcp 1518214910 10.134.172.254 60569 typ host tcptype passive generation 0\r\na=candidate:1610196941 1 udp 1686052607 82.166.93.197 61966 typ srflx raddr 11.0.0.244 rport 61966 generation 0\r\na=candidate:1610196941 2 udp 1686052606 82.166.93.197 63816 typ srflx raddr 11.0.0.244 rport 63816 generation 0\r\na=candidate:2274372738 1 udp 1685987071 176.13.15.205 5879 typ srflx raddr 10.134.172.254 rport 50435 generation 0\r\na=candidate:2274372738 2 udp 1685987070 176.13.15.205 5860 typ srflx raddr 10.134.172.254 rport 63396 generation 0\r\na=ice-ufrag:g8lHDtPwH7m5xRex\r\na=ice-pwd:Q6jcBJNTWAyu0JTuIaQAeNI3\r\na=fingerprint:sha-256 0F:A1:68:51:87:3E:B4:C1:0D:33:97:40:78:22:2A:8C:D2:B6:46:23:F5:99:C9:88:5D:34:DB:E2:C5:94:B3:DD\r\na=setup:actpass\r\na=mid:video\r\na=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:3 http:\/\/www.webrtc.org\/experiments\/rtp-hdrext\/abs-send-time\r\na=extmap:4 urn:3gpp:video-orientation\r\na=recvonly\r\na=rtcp-mux\r\na=rtpmap:100 VP8\/90000\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=rtcp-fb:100 goog-remb\r\na=rtcp-fb:100 transport-cc\r\na=rtpmap:101 VP9\/90000\r\na=rtcp-fb:101 ccm fir\r\na=rtcp-fb:101 nack\r\na=rtcp-fb:101 nack pli\r\na=rtcp-fb:101 goog-remb\r\na=rtcp-fb:101 transport-cc\r\na=rtpmap:116 red\/90000\r\na=rtpmap:117 ulpfec\/90000\r\na=rtpmap:96 rtx\/90000\r\na=fmtp:96 apt=100\r\n"}}

//          }, logError);
      }
      else{
          return;
          pc.setRemoteDescription(new RTCSessionDescription({type:'offer',sdp:mediasdp}), function () {
              if (pc.remoteDescription.type == "offer")
                  pc.createAnswer(function(desc) {
                      console.log('createAnswer', desc);
                      pc.setLocalDescription(desc, function () {
                          console.log('setLocalDescription', pc.localDescription);
//            socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
//            allcom.sendWebrtcMessage(fromId, "ANSWER",{'sdp': pc.localDescription });
                      }, logError);
                  }, logError);
          }, logError);
      }

      }
  };
  function createOffer() {
    pc.createOffer(function(desc) {
      console.log('createOffer', desc);
      mydesc=desc;
//      return;
        mycandidates=[];
      pc.setLocalDescription(desc, function () {
        console.log('setLocalDescription', pc.localDescription);
//        return;
          if (pc.localDescription.sdp.indexOf("candidate")==-1)
              return;
          let callid=guid();
          callID=null;
          let param1= {
              dialogParams: {
                  callID: callid
                  , caller_id_name: "1003"
                  , caller_id_number: "1003"
                  , destination_number: container.state.roomID
                  , localTag:null
                  , login: "1003@"+host
                  , remote_caller_id_name: container.state.roomID
                  , remote_caller_id_number: container.state.roomID
                  , screenShare: false
                  , tag: "webcam"
                  , useMic: "any"
                  , useSpeak: "any"
                  , useStereo: false
                  , useVideo: false
               , useCamera: "any"
                 , videoParams: {"minFrameRate": 30, "minWidth": "1280", "minHeight": "720"}
              }
              , sdp: pc.localDescription.sdp
              , sessid: sessionid
          };
          offerSDP=pc.localDescription.sdp;
          jrpc.call('verto.invite', param1).then(function (result) {
              console.log("invite return:"+JSON.stringify(result));
              callID=result.callID;
              container.setState({status:'ready'})
          });
 //       socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription });
//        allcom.sendWebrtcMessage(socketId,"OFFER",{'sdp':pc.localDescription});
//          {"jsonrpc":"2.0","method":"verto.invite","id":2,"params":{"dialogParams":{"remote_caller_id_number":"1008","useVideo":false,"useMic":"any","useStereo":false,"tag":"webcam","login":"1000@159.203.164.7","useCamera":"any","videoParams":{"minFrameRate":30,"minWidth":"1280","minHeight":"720"},"destination_number":"1008","screenShare":false,"caller_id_name":"FreeSWITCH User","caller_id_number":"1000","callID":"0CD433FC-A909-4DF2-BC46-0A4A94E9B800","remote_caller_id_name":"Outbound Call","useSpeak":"any"},"sessid":"53FB0781-B586-4CDA-98C6-558680663B46","sdp":"v=0\r\no=- 8564086442942257834 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio video\r\na=msid-semantic: WMS\r\nm=audio 58157 UDP\/TLS\/RTP\/SAVPF 111 103 104 9 102 0 8 106 105 13 127 126\r\nc=IN IP4 82.166.93.197\r\na=rtcp:52576 IN IP4 82.166.93.197\r\na=candidate:3168280865 1 udp 2122260223 11.0.0.244 58157 typ host generation 0\r\na=candidate:1260196625 1 udp 2122194687 10.134.172.254 58951 typ host generation 0\r\na=candidate:3168280865 2 udp 2122260222 11.0.0.244 52576 typ host generation 0\r\na=candidate:1260196625 2 udp 2122194686 10.134.172.254 58945 typ host generation 0\r\na=candidate:4066106833 1 tcp 1518280447 11.0.0.244 60562 typ host tcptype passive generation 0\r\na=candidate:94302177 1 tcp 1518214911 10.134.172.254 60563 typ host tcptype passive generation 0\r\na=candidate:4066106833 2 tcp 1518280446 11.0.0.244 60564 typ host tcptype passive generation 0\r\na=candidate:94302177 2 tcp 1518214910 10.134.172.254 60565 typ host tcptype passive generation 0\r\na=candidate:1610196941 1 udp 1686052607 82.166.93.197 58157 typ srflx raddr 11.0.0.244 rport 58157 generation 0\r\na=candidate:1610196941 2 udp 1686052606 82.166.93.197 52576 typ srflx raddr 11.0.0.244 rport 52576 generation 0\r\na=candidate:2274372738 2 udp 1685987070 176.13.15.205 5834 typ srflx raddr 10.134.172.254 rport 58945 generation 0\r\na=candidate:2274372738 1 udp 1685987071 176.13.15.205 5840 typ srflx raddr 10.134.172.254 rport 58951 generation 0\r\na=ice-ufrag:g8lHDtPwH7m5xRex\r\na=ice-pwd:Q6jcBJNTWAyu0JTuIaQAeNI3\r\na=fingerprint:sha-256 0F:A1:68:51:87:3E:B4:C1:0D:33:97:40:78:22:2A:8C:D2:B6:46:23:F5:99:C9:88:5D:34:DB:E2:C5:94:B3:DD\r\na=setup:actpass\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:3 http:\/\/www.webrtc.org\/experiments\/rtp-hdrext\/abs-send-time\r\na=recvonly\r\na=rtcp-mux\r\na=rtpmap:111 opus\/48000\/2\r\na=fmtp:111 minptime=10; useinbandfec=1\r\na=rtpmap:103 ISAC\/16000\r\na=rtpmap:104 ISAC\/32000\r\na=rtpmap:9 G722\/8000\r\na=rtpmap:102 ILBC\/8000\r\na=rtpmap:0 PCMU\/8000\r\na=rtpmap:8 PCMA\/8000\r\na=rtpmap:106 CN\/32000\r\na=rtpmap:105 CN\/16000\r\na=rtpmap:13 CN\/8000\r\na=rtpmap:127 red\/8000\r\na=rtpmap:126 telephone-event\/8000\r\na=maxptime:60\r\nm=video 61966 UDP\/TLS\/RTP\/SAVPF 100 101 116 117 96\r\nc=IN IP4 82.166.93.197\r\na=rtcp:63816 IN IP4 82.166.93.197\r\na=candidate:3168280865 1 udp 2122260223 11.0.0.244 61966 typ host generation 0\r\na=candidate:1260196625 1 udp 2122194687 10.134.172.254 50435 typ host generation 0\r\na=candidate:3168280865 2 udp 2122260222 11.0.0.244 63816 typ host generation 0\r\na=candidate:1260196625 2 udp 2122194686 10.134.172.254 63396 typ host generation 0\r\na=candidate:4066106833 1 tcp 1518280447 11.0.0.244 60566 typ host tcptype passive generation 0\r\na=candidate:94302177 1 tcp 1518214911 10.134.172.254 60567 typ host tcptype passive generation 0\r\na=candidate:4066106833 2 tcp 1518280446 11.0.0.244 60568 typ host tcptype passive generation 0\r\na=candidate:94302177 2 tcp 1518214910 10.134.172.254 60569 typ host tcptype passive generation 0\r\na=candidate:1610196941 1 udp 1686052607 82.166.93.197 61966 typ srflx raddr 11.0.0.244 rport 61966 generation 0\r\na=candidate:1610196941 2 udp 1686052606 82.166.93.197 63816 typ srflx raddr 11.0.0.244 rport 63816 generation 0\r\na=candidate:2274372738 1 udp 1685987071 176.13.15.205 5879 typ srflx raddr 10.134.172.254 rport 50435 generation 0\r\na=candidate:2274372738 2 udp 1685987070 176.13.15.205 5860 typ srflx raddr 10.134.172.254 rport 63396 generation 0\r\na=ice-ufrag:g8lHDtPwH7m5xRex\r\na=ice-pwd:Q6jcBJNTWAyu0JTuIaQAeNI3\r\na=fingerprint:sha-256 0F:A1:68:51:87:3E:B4:C1:0D:33:97:40:78:22:2A:8C:D2:B6:46:23:F5:99:C9:88:5D:34:DB:E2:C5:94:B3:DD\r\na=setup:actpass\r\na=mid:video\r\na=extmap:2 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:3 http:\/\/www.webrtc.org\/experiments\/rtp-hdrext\/abs-send-time\r\na=extmap:4 urn:3gpp:video-orientation\r\na=recvonly\r\na=rtcp-mux\r\na=rtpmap:100 VP8\/90000\r\na=rtcp-fb:100 ccm fir\r\na=rtcp-fb:100 nack\r\na=rtcp-fb:100 nack pli\r\na=rtcp-fb:100 goog-remb\r\na=rtcp-fb:100 transport-cc\r\na=rtpmap:101 VP9\/90000\r\na=rtcp-fb:101 ccm fir\r\na=rtcp-fb:101 nack\r\na=rtcp-fb:101 nack pli\r\na=rtcp-fb:101 goog-remb\r\na=rtcp-fb:101 transport-cc\r\na=rtpmap:116 red\/90000\r\na=rtpmap:117 ulpfec\/90000\r\na=rtpmap:96 rtx\/90000\r\na=fmtp:96 apt=100\r\n"}}

      }, logError);
    }, logError);
  }

  var answerDesc=null;
  function createAnswerFinal(sendAnswer) {
      if (pc.remoteDescription.type == "offer")
          if (sendAnswer==false)
          pc.createAnswer(function (desc) {
              console.log('createAnswer', desc);
              answerDesc=desc;
              // if (sendAnswer==false)
              //     return;
              pc.setLocalDescription(desc, function () {
                  console.log('setLocalDescription', pc.localDescription);
                  let param1 = {
                      dialogParams: {
                          callID: callID
                          , caller_id_name: offerParams.caller_id_name
                          , caller_id_number: offerParams.caller_id_number
//                          , destination_number: container.state.roomID
                          , localTag:null
                          , login: "1004@"+host
                          , remote_caller_id_name: container.state.roomID
                          , remote_caller_id_number: container.state.roomID
                          , screenShare: false
                          , tag: "webcam"
                          , useMic: "any"
                          , useSpeak: "any"
                          , useStereo: false
                          , useVideo: false
                          , useCamera: "any"
                          , videoParams: {"minFrameRate": 30, "minWidth": "1280", "minHeight": "720"}
                      }
                      , callID: callID
                      , sdp: pc.localDescription.sdp
                      , sessid: sessionid
                  };
                  let params={
                      dialogParams:{
                          screenShare:false,
                          useMic:"any",
                          useSpeak:"any",
                          tag:"webcam",
                          localTag:null,
                          login:"1004@i.mailwalk.com",
                          videoParams:{"minWidth":"1280","minHeight":"720","minFrameRate":30},
                          callID:callID,
                          caller_id_name:offerParams.caller_id_name,
                          caller_id_number:offerParams.caller_id_number,
                          callee_id_name:"APP User",
                          callee_id_number:"1004",
                          display_direction:"outbound",
                          remote_caller_id_name:offerParams.caller_id_name,
                          remote_caller_id_number:offerParams.caller_id_name
                      }
                      , sdp: pc.localDescription.sdp
                      , sessid: sessionid
                  }
                  console.log("answer:" + JSON.stringify(params));
                  if (sendAnswer) {
//                     param1.sdp=offerSDP?offerSDP:pc.localDescription.sdp;
                      jrpc.call('verto.answer', params).then(function (result) {
                          console.log("answered:" + JSON.stringify(result));
                          container.setState({status: 'ready'})
                      });
                  }
                  else
//                      return;
                      jrpc.call('verto.answer', params).then(function (result) {
                          console.log("answered:" + JSON.stringify(result));
                          container.setState({status: 'ready'})
                      });
//            socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
//            allcom.sendWebrtcMessage(fromId, "ANSWER",{'sdp': pc.localDescription });
              }, logError);
          }, logError);
        else{
            return;
            pc.setLocalDescription(answerDesc, function () {
              let params={
                  dialogParams:{
                      screenShare:false,
                      useMic:"any",
                      useSpeak:"any",
                      tag:"webcam",
                      localTag:null,
                      login:"1004@i.mailwalk.com",
                      videoParams:{"minWidth":"1280","minHeight":"720","minFrameRate":30},
                      callID:callID,
                      caller_id_name:offerParams.caller_id_name,
                      caller_id_number:offerParams.caller_id_number,
                      callee_id_name:"APP User",
                      callee_id_number:"1004",
                      display_direction:"outbound",
                      remote_caller_id_name:offerParams.caller_id_name,
                      remote_caller_id_number:offerParams.caller_id_name
                  }
                  , sdp: pc.localDescription.sdp
                  , sessid: sessionid
              }
                  console.log('setLocalDescription', pc.localDescription);
                  let param1 = {
                      callID: callID
//                      , sdp: pc.localDescription.sdp
                      ,sdp:offerSDP?offerSDP:pc.localDescription.sdp
                      , sessid: sessionid
                  };
                  console.log("media:" + JSON.stringify(params));
                  if (sendAnswer)
                      jrpc.call('verto.answer', params).then(function (result) {
                          console.log("answer:" + JSON.stringify(result));
                          container.setState({status: 'ready'})
                      });
//            socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
//            allcom.sendWebrtcMessage(fromId, "ANSWER",{'sdp': pc.localDescription });
            }, logError);
          }

  }
  function addRemoteCandidates(offerSDP) {
      let newsdp = null;
      let lines = offerSDP.split('\n')
          .map(l => l.trim()); // split and remove trailing CR
      lines.forEach(function (line) {
          if (line.indexOf('a=candidate:') === 0) {
              let parts = line.split(':');
              console.log('candidate:', parts[1]);
//                  let candidate=new RTCIceCandidate({candidate:parts[1]});
              let candidate = new RTCIceCandidate({candidate: parts[1], sdpMid: 'audio', sdpMLineIndex: 0});
              if (candidate)
                  pc.addIceCandidate(candidate);
          }
          else {
              if (newsdp)
                  newsdp += '\n' + line;
              else
                  newsdp = line;
          }
      });
      return newsdp;
  }
  function createAnswer(){
      if (!offerParams)
          return;
      console.log("offerSDP:"+offerParams.sdp);
        pc.setRemoteDescription(new RTCSessionDescription({type: 'offer', sdp: offerParams.sdp}), function () {
//        pc.setRemoteDescription(new RTCSessionDescription(offerParams), function () {
            addRemoteCandidates(offerParams.sdp);
            createAnswerFinal(false);
            console.log("setRemoteDescription success:");
        }, function (error) {
            console.log("setRemoteDescription failed:", error);
        });

    }
  pc.onnegotiationneeded = function () {
    console.log('onnegotiationneeded');
//    return;
    if (isOffer) {
      createOffer();
    }
   else
        createAnswer();
//     allcom.sendWebrtcMessage(socketId,"ACCEPT","react-native");
//     console.log("send ACCEPT to:"+socketId);
//   }
  }

  pc.oniceconnectionstatechange = function(event) {
    console.log('oniceconnectionstatechange',  event.target.iceGatheringState+":"+event.target.signalingState+","+event.target.iceConnectionState);
      if (event.target.iceConnectionState === 'completed') {
          setTimeout(() => {
              getStats();
          }, 1000);
      }
      if (event.target.iceConnectionState === 'connected') {
//          createDataChannel();
          InCallManager.start({media: 'audio'}); // audio/video, default: audio
          if (Platform.OS=='android')
              InCallManager.setSpeakerphoneOn(true);
          else
              InCallManager.setForceSpeakerphoneOn(true);
          DeviceEventEmitter.addListener('Proximity', function (data) {
              console.log(JSON.stringify(data));
          });
          container.setState({status:'connected'});
      }
      container.setState({status:event.target.iceConnectionState});
      if (event.target.iceConnectionState === 'disconnected') {
          InCallManager.stop();
          if (reconnect)
          Alert.alert(
              '重连？',
              "Lost connection",
              [
                  {text: 'OK', onPress: () => {
                      console.log('OK Pressed')
                      createOffer();
                  }
                  },
                  {text: 'NO', onPress: () => {
                      console.log('NO Pressed')
                      setTimeout(() => {
                          getStats();
                      }, 1000);

                  }
                  },
              ]
          )
      }
      if (event.target.iceConnectionState === 'failed') {
      }

//    container.onCallState(event.target.iceConnectionState);
  };
  pc.onsignalingstatechange = function(event) {
    console.log('onsignalingstatechange', event.target.signalingState);
  };

  pc.onaddstream = function (event) {
    console.log('onaddstream', event.stream);
    container.setState({info: 'One peer join!'});
    peerConnected();

    var remoteList = container.state.remoteList;
    remoteList[socketId] = event.stream.toURL();
    container.setState({ remoteList: remoteList });
//    allcom.sendWebrtcMessage(socketId,"ACCEPT","react-native");
  };
    if (localStream) {
      pc.addStream(localStream);
  }
  else {
     // return;
      getLocalStream(false, (localStream) => {
          pc.addStream(localStream);
          let newsdp = null;
          let lines = offerSDP.split('\n')
              .map(l => l.trim()); // split and remove trailing CR
          lines.forEach(function (line) {
              if (line.indexOf('a=candidate:') === 0) {
                  let parts = line.split(':');
                  console.log('candidate:', parts[1]);
//                  let candidate=new RTCIceCandidate({candidate:parts[1]});
                  let candidate = new RTCIceCandidate({candidate: parts[1], sdpMid: 'audio', sdpMLineIndex: 0});
                  if (candidate)
                      pc.addIceCandidate(candidate);
              }
              else {
                  if (newsdp)
                      newsdp += '\n' + line;
                  else
                      newsdp = line;
              }
          });
          console.log("ajusted sdp:" + newsdp);
//          return;
          pc.setRemoteDescription(new RTCSessionDescription({type: 'offer', sdp: offerSDP}), function () {
              if (pc.remoteDescription.type == "offer")
                  pc.createAnswer(function (desc) {
                      console.log('createAnswer', desc);
                      pc.setLocalDescription(desc, function () {
                          console.log('setLocalDescription', pc.localDescription);
                          let param1 = {
                              callID: callID
                              , sdp: pc.localDescription.sdp
                              , sessid: sessionid
                          };
                          console.log("answer:" + JSON.stringify(param1));
                          jrpc.call('verto.answer', param1).then(function (result) {
                              console.log("answered:" + result);
                              container.setState({status: 'ready'})
                          });
//            socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
//            allcom.sendWebrtcMessage(fromId, "ANSWER",{'sdp': pc.localDescription });
                      }, logError);
                  }, logError);
          }, logError);

      });
  }
    // if (!isOffer)
    //     createAnswer();
  return pc;
}
var callID=null;
export function WSexchange(data,from,container,remoteAnsered) {
  var fromId = from;//data.from;
  var pc;
  if (from && fromId in pcPeers) {
    pc = pcPeers[fromId];
  } else {
      fromId=data.caller_id_number;
      callID=data.callID;
    pc = WScreatePC(fromId, false,container);
    return;
  }
//    pc = new RTCPeerConnection(configuration);
  if (data.sdp) {
    console.log('get candidates from sdp ...', data);
      let newsdp=null;
//      let res = transform.parse(data.sdp);
      let lines = data.sdp.split('\n')
          .map(l => l.trim()); // split and remove trailing CR
      lines.forEach(function(line) {
          if (line.indexOf('a=candidate:') === 0) {
              let parts = line.split(':');
              console.log('candidate:', parts[1]);
              let candidate=new RTCIceCandidate({candidate:parts[1],sdpMid:'audio',sdpMLineIndex:0});
//              let candidate=new RTCIceCandidate({candidate:line,sdpMid:'audio',sdpMLineIndex:0});
              // if (candidate)
              //     pc.addIceCandidate(candidate);
          }
          else {
              if (newsdp)
                  newsdp += '\n'+line ;
              else
                  newsdp = line;
          }
      });
//        data.sdp=newsdp;
      console.log('get candidates from sdp done:'+newsdp);
//    pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
      if (remoteAnsered)
    pc.setRemoteDescription(new RTCSessionDescription(data), function () {
        console.log("setRemoteDescription success");
      if (pc.remoteDescription.type == "offer")
        pc.createAnswer(function(desc) {
          console.log('createAnswer', desc);
          pc.setLocalDescription(desc, function () {
            console.log('setLocalDescription', pc.localDescription);
//            socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
//            allcom.sendWebrtcMessage(fromId, "ANSWER",{'sdp': pc.localDescription });
          }, logError);
        }, logError);
    }, logError);
  } else {
    console.log('exchange candidate', data);
    if (data.candidate)
       pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
}

export function WSleave(socketId,container) {
  console.log('leave', socketId);
//  allcom.sendWebrtcMessage(socketId, "BYE","I am quit");
    let param1 = {
        callID: callID
        , sessid: sessionid
    };
    console.log("byebye:" + JSON.stringify(param1));
    jrpc.call('verto.bye', param1).then(function (result) {
        console.log("bye:" + result);
        container.setState({status: 'ready'})
    });
  var pc = pcPeers[socketId];
//  var viewIndex = pc.viewIndex;
  if (pc==null)
    return;
  pc.close();
  delete pcPeers[socketId];

  var remoteList = container.state.remoteList;
  delete remoteList[socketId]
  container.setState({ remoteList: remoteList });
  container.setState({info: 'One peer leave!'});
}
/*
socket.on('exchange', function(data){
  exchange(data);
});
socket.on('leave', function(socketId){
  leave(socketId);
});

socket.on('connect', function(data) {
  console.log('connect');
  getLocalStream(true, function(stream) {
    localStream = stream;
    if (container==null)
      return;
    container.setState({selfViewSrc: stream.toURL()});
    container.setState({status: 'ready', info: 'Please enter or create room ID'});
  });
});
*/
function logError(error) {
  console.log("logError", error);
}

function mapHash(hash, func) {
  var array = [];
  for (var key in hash) {
    var obj = hash[key];
    array.push(func(obj, key));
  }
  return array;
}

function peerConnected() {
  if (RTCSetting) {
    RTCSetting.setAudioOutput('speaker');
    RTCSetting.setKeepScreenOn(true);
    RTCSetting.setProximityScreenOff(true);
  }
}

function getStats() {
    const pc = pcPeers[Object.keys(pcPeers)[0]];
    if (pc.getRemoteStreams() && pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
        const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
        console.log('track', track);
        pc.getStats(track, function(report) {
            console.log('getStats report', report);
        }, logError);
    }
}

var container;
//configure
var simple_jsonrpc = require('simple-jsonrpc-js');
var jrpc = new simple_jsonrpc();
//var host="192.168.31.158";
//var host="192.168.0.134";
var host="i.mailwalk.com";
var socket = null;
var lastMessageID=0;
var callbacks = {
    onMessage: function (verto, dialog, msg, data) {
        console.log("msg ", msg);
        console.log("data ", data);
    },
    onDialogState: function(d) {
        cur_call = d;

        if (d.state == Verto.enum.state.ringing) {
            ringing = true;
        } else {
            ringing = false;
        }

        switch (d.state) {
            case Verto.enum.state.ringing:
                display("Call From: " + d.cidString());

                Alert.alert(
                    '接听？',
                    d.cidString(),
                    [
                        {text: 'OK', onPress: () => {
                            console.log('OK Pressed')
//                            WSanswerCall(offerParams.caller_id_number,container);
                            if (cur_call)
                            cur_call.answer({
                                useStereo: false,
                                callee_id_name: '1004',
                                callee_id_number: '1004',
                            });
                        }
                        },
                        {text: 'NO', onPress: () => {
                            console.log('NO Pressed')
                            cur_call.hangup();
                            // setTimeout(() => {
                            //     getStats();
                            // }, 1000);

                        }
                        },
                    ]
                )
                // $("#ansbtn").click(function() {
                //     cur_call.answer({
                //         useStereo: $("#use_stereo").is(':checked'),
                //         callee_id_name: $("#name").val(),
                //         callee_id_number: $("#cid").val(),
                //     });
                //     $('#dialog-incoming-call').dialog('close');
                // });
                //
                // $("#declinebtn").click(function() {
                //     cur_call.hangup();
                //     $('#dialog-incoming-call').dialog('close');
                // });

                goto_dialog("incoming-call");
//                $("#dialog-incoming-call-txt").text("Incoming call from: " + d.cidString());

                // if (d.params.wantVideo) {
                //     $("#vansbtn").click(function() {
                //         $("#use_vid").prop("checked", true);
                //         cur_call.answer({
                //             useVideo: true,
                //             useStereo: $("#use_stereo").is(':checked')
                //         });
                //     });
                //     // the buttons in this jquery mobile wont hide .. gotta wrap them in a div as a workaround
                //     $("#vansdiv").show();
                // } else {
                //     $("#vansdiv").hide();
                // }

                break;

            case Verto.enum.state.trying:
                display("Calling: " + d.cidString());
                goto_page("incall");
                break;
            case Verto.enum.state.early:
            case Verto.enum.state.active:
                display("Talking to: " + d.cidString());
                goto_page("incall");
                break;
            case Verto.enum.state.hangup:
                //$("#main_info").html("Call ended with cause: " + d.cause);
                goto_page("main");
            case Verto.enum.state.destroy:
                //$("#hangup_cause").html("");
                clearConfMan();

                cur_call = null;
                break;
            case Verto.enum.state.held:
                break;
            default:
                display("");
                break;
        }
    },
    onWSLogin: function(v, success) {
        display("");

        cur_call = null;
        ringing = false;

        if (success) {
            online(true);

            /*
             verto.subscribe("presence", {
             handler: function(v, e) {
             console.error("PRESENCE:", e);
             }
             });
             */

            if (!window.location.hash) {
                goto_page("main");
            }

            if (autocall) {
                autocall = false;
                docall();
            }
        } else {
            goto_page("main");
            goto_dialog("login-error");
        }

    },
    onWSClose: function(v, success) {
        display("");
        online(false);
        var today = new Date();
//        $("#errordisplay").html("Connection Error.<br>Last Attempt: " + today);
        goto_page("main");
    },

    onEvent: function(v, e) {
        console.debug("GOT EVENT", e);
    },
};
function display(msg) {
//    $("#calltitle").html(msg);
    console.log(msg);
}
var first_login = false;
var online_visible = false;
function online(on) {
    if (on) {
        // $("#online").show();
        // $("#offline").hide();
        container.setState({status:'ready'})
        first_login = true;
    } else {
        container.setState({status:'init'})

        // $("#online").hide();
        // $("#offline").show();
    }

    online_visible = on;
}
function goto_dialog(where) {
    console.log("goto_dialog:",where);
//    $( ":mobile-pagecontainer" ).pagecontainer( "change", "#dialog-" + where, { role: "dialog" } );
}

function goto_page(where, force) {
    console.log("goto_page:",where);
//    $( ":mobile-pagecontainer" ).pagecontainer( "change", "#page-" + where);
}
function clearConfMan() {
    if (confMan) {
        confMan.destroy();
        confMan = null;
    }

    // $("#conf").hide();
    // $("#message").hide();
    chatting_with = null;
}

var offerParams=null;

var cur_call = null;
var confMan = null;
var verto;
var ringing = false;
var autocall = false;
var chatting_with = false;

function setRemoteStrean(stream) {
    if (stream==null)
        return;
    let remoteList = container.state.remoteList;
    remoteList.push(stream.toURL());
    container.setState({ remoteList: remoteList });
}

function init(user,pass,host) {
    cur_call = null;
    // var webcam1=container.refs.webcam.getDOMNode();
    // var webcam2=ReactNative.findDOMNode(container.refs.webcam);
//    var webcam3=findDOMNode(container.refs.webcam);
    verto = new Verto({
        login: user+"@"+host,
        passwd: pass,
        socketUrl: "wss://"+host+":8082",
        //tag: setRemoteStrean,
        tag:"webcam",
        tagContainer:container,//"webcam",
//        tag:container.refs.webcam,//"webcam",
        iceServers: true
    }, callbacks);
    // verto = new $.verto({
    //     login: user+"@"+host,
    //     passwd: pass,
    //     socketUrl: "wss://"+host+":8082",
    //     tag: "webcam",
    //     iceServers: true
    // }, callbacks);
};
function login(user,pass,host) {
    init(user,pass,host);
    return;
    socket = new WebSocket("wss://"+host+":8082");
    socket.onmessage = function(event) {
        console.log("onmessage:"+JSON.stringify(event.data));
        let res=JSON.parse(event.data);
        if (res.id)
            lastMessageID=res.id;
        if (res.method==='verto.invite' && res.id && res.params){
//            let response =    {"jsonrpc":"2.0","id":res.id,"result":{"message":"CALL CREATED","callID":res.params.callID,"sessid":sessionid}};
            let response =  {"jsonrpc":"2.0","id":res.id,"result":{"method":"verto.invite"}};
//        let response =    {"jsonrpc":"2.0","id":lastMessageID+1,result:{message:"CALL CREATED",callID:callID}};
            socket.send(JSON.stringify(response));
            console.log("response :"+JSON.stringify(response));}

        jrpc.messageHandler(event.data);
//        return;

        //   WSexchange(event.data,null,container);
    };

    socket.onerror = function(error) {
        console.error("Error: " + error.message);
    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            console.info('Connection close was clean');
        } else {
            console.error('Connection suddenly close');
        }
        console.info('close code : ' + event.code + ' reason: ' + event.reason);
    };

//usage
//after connect
    socket.onopen = function(){

        //calls
        //method: "login",
        var params = {jsonrpc: "2.0",  params: {sessid: "a321b653-7abd-54a9-166e-a70374771923"}, id: 2};
        var params_login = {"jsonrpc":"2.0","params":{"login":"1003@192.168.0.134","passwd":"123456","loginParams":{},"sessid":"b321b653-7abd-54a9-166e-b70374771923"},"id":3};
        var params1={"login":user+"@"+host,"passwd":pass,"loginParams":{},"sessid":sessionid};
//    {"jsonrpc":"2.0","method":"login","id":1,"params":
//        {"login":"1000@MY-IP-ADDRESS","loginParams":{},"userVariables":{},"passwd":"1234","sessid":"53FB0781-B586-4CDA-98C6-558680663B46"}}

        jrpc.call('login', params1).then(function (result) {
            console.log(result);
            container.setState({status:'ready'})
        });

        // jrpc.call('mul', {y: 3, x: 2}).then(function (result) {
        //     document.getElementsByClassName('paragraph')[0].innerHTML += 'mul(2, 3) result: ' + result + '<br>';
        // });
        //
        // jrpc.batch([
        //     {call:{method: "add", params: [5,2]}},
        //     {call:{method: "mul", params: [100, 200]}},
        //     {call:{method: "create", params: {item: {foo: "bar"}, rewrite: true}}}
        // ]);
    };

}
//var host="i.mailwalk.com";
//var socket = new WebSocket("wss://"+host+":8082");

//wait of call
// jrpc.on('view.setTitle', function(title){
//   console.log(title);
// //    document.getElementsByClassName('title')[0].innerHTML = title;
// });

jrpc.on('verto.invite', function(params) {
    console.log("invite:"+JSON.stringify(params));
    if (params.sdp) {
        offerSDP = params.sdp;
        var res = transform.parse(params.sdp);
        console.log("invite sdp:"+JSON.stringify(res));
    }
    // if (params.type==null)
    //     params.type='offer';
    if (params.callID)
        callID=params.callID;
//    console.log(JSON.stringify(res));
    localStream=null;
    offerParams=params;
    // let response = {id:params.id};
    // jrpc.on('verto.invite', function(response) {
    //     console.log('replay invite');
    // });
    Alert.alert(
        '接听？',
        offerParams.caller_id_name+':'+offerParams.caller_id_number,
        [
            {text: 'OK', onPress: () => {
                console.log('OK Pressed')
                WSanswerCall(offerParams.caller_id_number,container);
            }
            },
            {text: 'NO', onPress: () => {
                console.log('NO Pressed')
                setTimeout(() => {
                    getStats();
                }, 1000);

            }
            },
        ]
    )
//    WSexchange(params,null,container,true);
});
var offersdp=null;
var mediasdp=null;
var busy=false;
//jrpc.on('verto.answer', ['callID','sdp'],function(params) {
jrpc.on('verto.answer', function(params) {
    console.log("answer:"+JSON.stringify(params));
    if (busy)
        return;
    busy=true;
    if (params.sdp==null) {
        params.sdp = mediasdp;
        params.type = 'answer';
        if (mediasdp) {
            WSexchange(params, container.state.roomID, container,true);
//            mediasdp=null;
        }
    }
    else{
        let res = transform.parse(params.sdp);
        console.log("answer sdp:"+JSON.stringify(res));
        if (params.type==null)
            params.type = 'answer';
        WSexchange(params, container.state.roomID, container,false);
        mediasdp=params.sdp;

    }
    busy=false;
});
//onmessage:"{\"jsonrpc\":\"2.0\",\"id\":31,\"method\":\"verto.media\",\"params\":{\"callID\":\"487a8a9e-438e-4f3c-58ac-def02948bcae\",\"sdp\":\"v=0\\no=FreeSWITCH 1495253237 1495253238 IN IP4 192.168.0.134\\ns=FreeSWITCH\\nc=IN IP4 192.168.0.134\\nt=0 0\\na=msid-semantic: WMS 9fWEsYaaLJhnMGT55j3msl4Zowu1fWPe\\nm=audio 24824 UDP/TLS/RTP/SAVPF 111 110\\na=rtpmap:111 opus/48000/2\\na=fmtp:111 useinbandfec=1; minptime=10\\na=rtpmap:110 telephone-event/8000\\na=silenceSupp:off - - - -\\na=ptime:20\\na=sendrecv\\na=fingerprint:sha-256 6C:6E:49:30:27:DB:67:A9:E3:72:93:B0:9F:FB:6A:C8:D9:C1:27:38:A3:C9:0A:FA:F2:C6:7A:D5:86:8D:8A:87\\na=setup:active\\na=rtcp-mux\\na=rtcp:24824 IN IP4 192.168.0.134\\na=ssrc:1764020125 cname:2BJlqJl1jsfWYYRU\\na=ssrc:1764020125 msid:9fWEsYaaLJhnMGT55j3msl4Zowu1fWPe a0\\na=ssrc:1764020125 mslabel:9fWEsYaaLJhnMGT55j3msl4Zowu1fWPe\\na=ssrc:1764020125 label:9fWEsYaaLJhnMGT55j3msl4Zowu1fWPea0\\na=ice-ufrag:8K7rW1hanB2soIxg\\na=ice-pwd:96rqGCiPVnBKcjvaTsrGjyHx\\na=candidate:2593265626 1 udp 659136 192.168.0.134 24824 typ host generation 0\\nm=video 31608 UDP/TLS/RTP/SAVPF 96 98 100 127 125 97 99 101 124\\na=rtpmap:96 VP8/90000\\na=fingerprint:sha-256 6C:6E:49:30:27:DB:67:A9:E3:72:93:B0:9F:FB:6A:C8:D9:C1:27:38:A3:C9:0A:FA:F2:C6:7A:D5:86:8D:8A:87\\na=setup:active\\na=rtcp-mux\\na=rtcp:31608 IN IP4 192.168.0.134\\na=rtcp-fb:* fir \\nb=AS:256\\na=rtcp-fb:96 ccm fir\\na=ssrc:1016401846 cname:2BJlqJl1jsfWYYRU\\na=ssrc:1016401846 msid:9fWEsYaaLJhnMGT55j3msl4Zowu1fWPe v0\\na=ssrc:1016401846 mslabel:9fWEsYaaLJhnMGT55j3msl4Zowu1fWPe\\na=ssrc:1016401846 label:9fWEsYaaLJhnMGT55j3msl4Zowu1fWPev0\\na=ice-ufrag:Cjaip8mA6n3kUZH7\\na=ice-pwd:GgLYSzAu7vobAHM2RNa6LmxI\\na=candidate:4018402616 1 udp 659136 192.168.0.134 31608 typ host generation 0\\n\"}}"
//jrpc.on('verto.media', ['callID','sdp'], function(params) {
    jrpc.on('verto.media',  function(params) {
    console.log("media:"+JSON.stringify(params));
    if (params.sdp) {
        mediasdp = params.sdp;
        console.log("save sdp:"+mediasdp);
        WSexchange(params, container.state.roomID, container,false);
        // let candidate = new RTCIceCandidate(mediasdp);
        // var pc = pcPeers[container.state.roomID];
        //
        // if (pc && candidate)
        // pc.addIceCandidate(candidate).then(_=>{
        //     // Do stuff when the candidate is successfully passed to the ICE agent
        // }).catch(e=>{
        //     console.log("Error: Failure during addIceCandidate()");
        // });
    }
//    WSexchange(params,container.state.roomID,container);
});
//jrpc.on('verto.bye', [], function(params) {
jrpc.on('verto.bye', function(params) {
    console.log("media:"+JSON.stringify(params));
    reconnect=false;
    WSleave(container.state.roomID,container);

//    WSexchange(params,container.state.roomID,container);
});
jrpc.on('verto.display', function(params) {
    console.log("display:"+JSON.stringify(params));
//    WSexchange(params,container.state.roomID,container);
});
jrpc.on('result', function(title) {
    console.log("result:"+title);
});
jrpc.on('message', function(title) {
    console.log("message:"+title);
});
jrpc.on('method', function(title) {
    console.log("message:"+title);
});
jrpc.on('error', function(title) {
    console.log("error:"+title);
});

jrpc.toStream = function(_msg){
    socket.send(_msg);
};

// var jsonrpc = require('json-rpc-client');
//
// // create client and connect
// var client = new jsonrpc({ port: 8022, host: '192.168.0.134'})
// client.connect().then(function()
//     {
//         // send json rpc
//         //
//         var params = {jsonrpc: "2.0", method: "login", params: {sessid: "a321b653-7abd-54a9-166e-a70374771923"}, id: 2};
//         client.send('login', params).then(function(reply)
//             {
//                 // print complete reply
//                 console.log(reply)
//             },
//             //transport errors
//             function(error)
//             {
//                 console.error(error)
//             })
//     },
//     function(error)
//     {
//         console.error(error)
//     })

var RCTWebRTCDemo = React.createClass({
  getInitialState: function() {
    return {
      info: 'Initializing',
      status: 'init',
      roomID: '1004',//this.props.movie.mailFrom,
      isFront: true,
      selfViewSrc: null,
        username:'1004',
        password:'12345678',
        host:'i.mailwalk.com',
      remoteList: {}
    };
  },
  componentDidMount: function() {
    container = this;
      // if (Platform.OS=='android')
      //     InCallManager.setSpeakerphoneOn(true);
      // else
      //     InCallManager.setForceSpeakerphoneOn(true);
//      login(logininfo.username,logininfo.password,logininfo.host);
    // allcom.init(); // so websocket can get device token
    // allcom.setCallHandler(this);
    // if (this.props.movie.type && this.props.movie.type.toUpperCase()=="CALL")
    //   this._press(null);
    // else
    //   if (this.props.movie.mailFrom){
    //     join(this.props.movie.mailFrom);
    //   }
  },
  _press(event) {
    if (event){
      this.refs.roomID.blur();
      this.setState({status: 'connect', info: 'Connecting'});
      WSmakeCall(this.state.roomID,this);
//      join(this.state.roomID);
//      answerCall(this.this.state.roomID);
    }
    else{
      WSanswerCall(this.state.roomID,this);
    }
  },
  onCallMessage(message){
    console.log("onCallMessage:"+message.msg.type);
    if (message.msg.type=='leave')
      WSleave(message.from,this);
    else
    if (message.msg.type.toUpperCase()=='ACCEPT')
      WSmakeCall(message.from,this)
    else
//    if (message.msg.type.toUpperCase()=='OFFER')
      {
 //       message.msg.from=message.from;    
        WSexchange(message.msg.message,message.from,this);
      }
  },
  _switchVideoType() {
    var isFront = !this.state.isFront;
    this.setState({isFront});
    getLocalStream(isFront, function(stream) {
      if (localStream) {
        for (var id in pcPeers) {
          var pc = pcPeers[id];
          pc && pc.removeStream(localStream);
        }
        localStream.release();
      }
      localStream = stream;
      container.setState({selfViewSrc: stream.toURL()});

      for (var id in pcPeers) {
        var pc = pcPeers[id];
        pc && pc.addStream(localStream);
      }
    });
  },
    buttonLogin:function () {
        login(this.state.username,this.state.password,this.state.host);
//      login(logininfo.username,logininfo.password,logininfo.host);
    },
    hangup:function () {
        reconnect = false;

        WSleave(this.state.roomID,this);
    },
    renderLogin:function () {
      if (this.state.status == 'init')
      return  (<View>
                <TextInput
                    ref='username'
                    autoCorrect={false}
                    style={{width: 200, height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(text) => this.setState({username: text})}
                    value={this.state.username}
                />
                  <TextInput
                      ref='password'
                      autoCorrect={false}
                      style={{width: 200, height: 40, borderColor: 'gray', borderWidth: 1}}
                      onChangeText={(text) => this.setState({password: text})}
                      value={this.state.password}
                  />
                  <TextInput
                      ref='server'
                      autoCorrect={false}
                      style={{width: 200, height: 40, borderColor: 'gray', borderWidth: 1}}
                      onChangeText={(text) => this.setState({host: text})}
                      value={this.state.host}
                  />
                <Button title='login' style={styles.loginbutton} onPress={(e) => this.buttonLogin(e)}>登录</Button>
            </View>)
    },
  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          {this.state.info}
        </Text>
          <Text style={styles.welcome}>
              {this.state.status}
          </Text>
        <View style={{flexDirection: 'row'}}>
          <Text>
            {this.state.isFront ? "Use front camera" : "Use back camera"}
          </Text>
          <TouchableHighlight
            style={{borderWidth: 1, borderColor: 'black'}}
            onPress={this._switchVideoType}>
            <Text>Switch camera</Text>
          </TouchableHighlight>
        </View>
          {this.renderLogin()}
        { this.state.status == 'ready' || this.state.status =='closed'?
          (<View>
            <TextInput
              ref='roomID'
              autoCorrect={false}
              style={{width: 200, height: 40, borderColor: 'gray', borderWidth: 1}}
              onChangeText={(text) => this.setState({roomID: text})}
              value={this.state.roomID}
            />
            <TouchableHighlight
              onPress={this._press}>
              <Text>Enter room</Text>
            </TouchableHighlight>
              <Button title='Call' style={styles.loginbutton} onPress={(e) => this._press(e)}>呼叫</Button>
          </View>) : null
        }
          { this.state.status == 'connected' || this.state.status == 'completed'?
              (<View>
                      <Button title='login' style={styles.registerbutton} onPress={(e) => this.hangup(e)}>挂断</Button>
                  </View>
              ) : null
          }
        <video ref="webcam" id="webcam"  style={styles.selfView}/>
        {
          mapHash(this.state.remoteList, function(remote, index) {
            return <video key={index}  style={styles.remoteView}/>
          })
        }
      </View>
    );
  }
});
var logininfo={};
// class HomeScreen extends React.Component {
//     static navigationOptions = {
//         title: '登录',
//     };
//     constructor(props) {
//         super(props);
//         this.state = {
//             color: props.initialColor,
//             username:'1004',
//             password:'12345678',
//             host:'i.mailwalk.com',
//         };
//     }
//     buttonLogin() {
//         const { navigate } = this.props.navigation;
//         logininfo={username:this.state.username,password:this.state.password,host:this.state.host};
// //        login(this.state.username,this.state.password,this.state.host);
//         navigate('Chat');
//     };
//     render() {
//         return  (<View>
//             <TextInput
//                 ref='username'
//                 autoCorrect={false}
//                 style={{width: 200, height: 40, borderColor: 'gray', borderWidth: 1}}
//                 onChangeText={(text) => this.setState({username: text})}
//                 value={this.state.username}
//             />
//             <TextInput
//                 ref='password'
//                 autoCorrect={false}
//                 style={{width: 200, height: 40, borderColor: 'gray', borderWidth: 1}}
//                 onChangeText={(text) => this.setState({password: text})}
//                 value={this.state.password}
//             />
//             <TextInput
//                 ref='server'
//                 autoCorrect={false}
//                 style={{width: 200, height: 40, borderColor: 'gray', borderWidth: 1}}
//                 onChangeText={(text) => this.setState({host: text})}
//                 value={this.state.host}
//             />
//             <Button style={styles.loginbutton} onPress={(e) => this.buttonLogin(e)}>登录</Button>
//         </View>)
//     }
// }
//
// const CallApp = StackNavigator({
//     Home: { screen: HomeScreen },
//     Chat: { screen: RCTWebRTCDemo },
// });

//var styles = StyleSheet.create({
var styles={
  selfView: {
    width: 200,
    height: 100,
  },
  remoteView: {
    width: 100,
    height: 100,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
    loginbutton: {
        flex:0,
        backgroundColor: '#23a9e2',
        color: '#FFFFFF',
        //alignSelf:'center',
        alignItems:'center',
        height:40,
        width:300,
        paddingVertical: 10,
        paddingTop:5,
        marginBottom: 10,
        borderRadius: 4
    },
    registerbutton: {
        flex:0,
//        backgroundColor: 'darkgreen',
        backgroundColor: 'red',
        color: '#FFFFFF',
        paddingVertical: 10,
        marginBottom: 10,
        width:300,
        borderRadius: 4,
        height:40,
    },
};
//);

//AppRegistry.registerComponent('sipim', () => CallApp);
module.exports = RCTWebRTCDemo;
