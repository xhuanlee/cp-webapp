/**
 * Created by liwei on 03/07/2017.
 */
'use strict';

var React = require('react');
import { Platform, AppRegistry, Button,Image, StyleSheet, Text,TextInput, View,TouchableHighlight } from 'react-native-web';
import {Alert} from 'react-native-web-extended';

import { StackNavigator } from 'react-navigation';

import ReactDOM,{ findDOMNode } from 'react-dom';

import {Verto} from '../../verto/js/src/es6/verto';
import {session} from '../user';
import {Keypad} from './Keypad';
import {CallList} from '../faxtask';

function login(user,pass,host) {
    cur_call = null;
    logininfo={username:user,password:pass,host:host};
    let socketurl;
    if (host.startsWith('wss://'))
        socketurl=host;
    else {
        let protocal = location.protocol.indexOf('https:') == 0 || location.hostname == 'localhost' ? 'wss' : 'ws';
        if (protocal == 'ws') {
            alert("请用https登录");
            return;
        }
        let port = user.startsWith('force6042') ? 8083 : 8082;
        socketurl = protocal + "://" + host + ":" + port;
    }
    verto = new Verto({
        login: user+"@"+host,
        domain:'gfax.cn',
        passwd: pass,
//        socketUrl: "wss://"+host+":8082",
        socketUrl: socketurl,
        //tag: setRemoteStrean,
        tag:"webcam",
//        ringFile:'verto/demo/sounds/bell_ring2.wav',
        tagContainer:container,//"webcam",
        iceServers: true
    }, callbacks);
};

export function loginSoftSwitch(user,pass,host) {
    login(user,pass,host);
}
function stopRinging() {
    let ringer = document.getElementById("webring");
    if (ringer) {
        ringer.pause();
    }
}

function indicateRing() {
    let ringer = document.getElementById("webring");
    if (ringer) {
        ringer.src='audio/bell_ring2.wav';
        ringer.play();

        setTimeout(function() {
            stopRinging();
            if (cur_call && cur_call.state == Verto.enum.state.ringing) {
                indicateRing();
            }
        }, 6000);
    }
}

var callbacks = {
    onMessage: function (verto, dialog, msg, data) {
        console.log("msg ", msg);
        console.log("data ", data);
    },
    onDialogState: function(d) {
        cur_call = d;

        if (d.state == Verto.enum.state.ringing) {
            ringing = true;
            logoutAfterHangup=false;
            currentCallId=d.cidString();
            indicateRing();
        } else {
            ringing = false;
        }
        if (d)
           currentCallId=d.cidString();

        switch (d.state) {
            case Verto.enum.state.ringing:
                display("Call From: " + d.cidString());

                if (container==null){
                    window.workspace.setState({menuAction:'call',answerCall:true,caller_id_number:d.cidString()});
                    return;
                }
                else
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

//                goto_dialog("incoming-call");
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
                logoutAfterHangup=false;
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
                docall(autocallnumber);
                autocallnumber=null;
            }
        } else {
            online(false);
            goto_page("init");
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
        if (container)
            container.setState({status:'ready'})
        first_login = true;
    } else {
        if (container)
           container.setState({status:'init'})
        first_login = false;

        // $("#online").hide();
        // $("#offline").show();
    }

    online_visible = on;
}
function goto_dialog(where) {
    console.log("goto_dialog:",where);
//    $( ":mobile-pagecontainer" ).pagecontainer( "change", "#dialog-" + where, { role: "dialog" } );
    Alert.alert(
        'WARNING',
        where,
        [
            {text: 'OK', onPress: () => {
                console.log('OK Pressed')
            }
            },
        ]
    )
}

function goto_page(where, force) {
    console.log("goto_page:",where);
    if (container)
        container.setState({status:where});
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
function mapHash(hash, func) {
    var array = [];
    for (var key in hash) {
        var obj = hash[key];
        array.push(func(obj, key));
    }
    return array;
}
function docall(callee) {
//    $('#ext').trigger('change');

    if (cur_call) {
        return;
    }

//    $("#main_info").html("Trying");

    if (verto && online_visible)
        cur_call = verto.newCall({
            destination_number: callee,
            caller_id_name: logininfo.username,
            caller_id_number: logininfo.username,
            useVideo: false,
            useStereo: false
        });
    if (cur_call==null){
        autocall=true;
        autocallnumber=callee;
        if (logininfo)
            login(logininfo.username, logininfo.password, logininfo.host);
        else
        if (session.user.restapi.extension)
            login(session.user.restapi.extension.extension, session.user.restapi.extension.extenPwd, session.user.restapi.extension.switchWss);
    }
    else
        activeCall={caller:callee,start:new Date(),iscaller:true};
    if (container)
        container.setState({status:'dialing'});
    console.log('called newCall:'+callee);
}

var activeCall = null;
var offerParams=null;
var currentCallId;
var cur_call = null;
var logoutAfterHangup=false;
var confMan = null;
var verto;
var ringing = false;
var autocall = false;
var chatting_with = false;
var container;
var reconnect=true;
var localStream;
var logininfo={};
var autocallnumber = null;

//var CallView = React.createClass({
class CallView extends React.Component {
    static init(user,pass,host) {
        logininfo={username:user,password:pass,host:host};
        login(user,pass,host);
    };
    constructor(props) {
        super(props);
        this.getInitialState(props);
    }
    getInitialState(props) {
        if (session.user.restapi.extension) {
            console.log("session restapi.user :" + session.user.restapi.extension.extension);
            console.log("session restapi.user :" + JSON.stringify(session.user.restapi.extension));
            logininfo={username:session.user.restapi.extension.extension,password:session.user.restapi.extension.extenPwd,host:session.user.restapi.extension.switchWss};
        }
        else
        if (session.user.extension) {
            console.log("session user :" + session.user.extension.extension);
            console.log("session user :" + JSON.stringify(session.user.extension));
            logininfo={username:session.user.extension.extension,password:session.user.extension.extenPwd,host:session.user.extension.switchWss};
        }
        else
            console.log("session user 1:" + JSON.stringify(session.user));
        this.state = {
            info: 'Login',
            status: 'init',
            roomID: '',//session.user.restapi.extension?session.user.restapi.extension.extension:'',//'1004',//this.props.movie.mailFrom,
            dtmf:'',
            isFront: true,
            selfViewSrc: null,
            calllist:[],
            username:session.user.restapi.extension?session.user.restapi.extension.extension:'',
            password:session.user.restapi.extension?session.user.restapi.extension.extenPwd:'',
            host:session.user.restapi.extension?session.user.restapi.extension.switchWss:'',
            remoteList: {}
        };
    };
    componentWillUnmount(){
        container=null;
        // if (verto && confirm('退出电话功能'))
        //     this.logout();
    }
    ring(e){
        let ringer = document.getElementById("webring");
        ringer.src='verto/demo/sounds/bell_ring2.wav';
        ringer.play();
    }
    componentDidMount() {
        container = this;
        online(first_login);
        if (this.props.answerCall)
            Alert.alert(
                '接听？',
                this.props.caller_id_number,
                [
                    {text: 'OK', onPress: () => {
                        console.log('OK Pressed')
//                            WSanswerCall(offerParams.caller_id_number,container);
                        if (cur_call) {
//                            if (cur_call.verto.options.tagContainer == null) {
                                cur_call.verto.options.tagContainer = this;
                            cur_call.audioStream = document.getElementById("webcam");
                            if (cur_call.rtc)
                                cur_call.rtc.options.useAudio = cur_call.audioStream;
                                console.log("fix container");
//                            }
                            cur_call.answer({
                                useStereo: false,
                                callee_id_name: logininfo.username,
                                callee_id_number: logininfo.username,
                            });
                        }
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
        else
            if (this.props.makeCallTo && this.props.makeCallTo.length>0){
              docall(this.props.makeCallTo);
            };
        window.workspace.setState({answerCall:false,caller_id_number:null});
        this.calllog();
        // if (Platform.OS=='android')
        //     InCallManager.setSpeakerphoneOn(true);
        // else
        //     InCallManager.setForceSpeakerphoneOn(true);
        if (!verto || !online_visible)
             login(logininfo.username,logininfo.password,logininfo.host);
        // allcom.init(); // so websocket can get device token
        // allcom.setCallHandler(this);
        // if (this.props.movie.type && this.props.movie.type.toUpperCase()=="CALL")
        //   this._press(null);
        // else
        //   if (this.props.movie.mailFrom){
        //     join(this.props.movie.mailFrom);
        //   }
    };
    logout(event) {
        if (cur_call)
            if (confirm('结束通话并退出')){
                logoutAfterHangup=true;
                cur_call.hangup();
                return;
            }
            else
                return;

        verto.logout('exit');
        verto.closeSocket();
        this.setState({info:'login',status:'init'});
        verto=null;
    };
    helpcall(event){
        this.setState({status: 'connect',roomID:'8051', info: 'Connecting'});
        docall('8051');
    }
    _press(event) {
        if (event){
            this.refs.roomID.blur();
            this.setState({status: 'connect', info: 'Connecting'});
//            docall(this.state.roomID);
            let callee=this.state.roomID;
            if (callee.indexOf('<')>=0 && callee.indexOf('>')>0)
                callee =callee.substring(callee.lastIndexOf("<")+1,callee.lastIndexOf(">"));
            if (callee.endsWith("@gfax.cn"))
                docall(callee);
            else
            if (callee.length<8)
                docall(callee);
            else
            if (callee.endsWith("@pstn"))
                docall(callee);
            else
                docall(callee+'@pstn');
//            WSmakeCall(this.state.roomID,this);
//      join(this.state.roomID);
//      answerCall(this.this.state.roomID);
        }
        else{
            WSanswerCall(this.state.roomID,this);
        }
    };
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
    };
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
            if (container)
                container.setState({selfViewSrc: stream.toURL()});

            for (var id in pcPeers) {
                var pc = pcPeers[id];
                pc && pc.addStream(localStream);
            }
        });
    };
    buttonLogin() {
        login(this.state.username,this.state.password,this.state.host);
//      login(logininfo.username,logininfo.password,logininfo.host);
    };
    hangup() {
        reconnect = false;
        if (cur_call)
            cur_call.hangup();
        this.setState({status:'ready'});

//        WSleave(this.state.roomID,this);
    };
    renderLogin() {
        if (this.state.status == 'init')
            return  (<View>
                <Text>
                    请确保您的电脑录音和放音设备。
                </Text>
                <TextInput
                    ref='username'
                    autoCorrect={false}
                    style={{display:'none',width: 200, height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(text) => this.setState({username: text})}
                    value={this.state.username}
                />
                <TextInput
                    ref='password'
                    secureTextEntry={true}
                    autoCorrect={false}
                    style={{display:'none',width: 200, height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(text) => this.setState({password: text})}
                    value={this.state.password}
                />
                <TextInput
                    ref='server'
                    autoCorrect={false}
                    style={{display:'none',width: 200, height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(text) => this.setState({host: text})}
                    value={this.state.host}
                />
                <Button title='我要通话' style={styles.loginbutton} onPress={(e) => this.buttonLogin(e)}>我要通话</Button>
            </View>)
    };
    _keypadPressed(value) {
        console.log('Send DTMF '+value+' for call id '+cur_call?currentCallId:'');
        let keych;
        switch (value){
            case 10:
                keych='*';
                break;
            case 11:
                keych='#';
                break;
            default:
                keych=value.toString();
        }
        if (cur_call) {
            cur_call.dtmf(keych);
            this.setState({dtmf: this.state.dtmf+keych});
        }
        else
            this.setState({roomID: this.state.roomID+keych,dtmf:''});
// Start playing back the tone corresponding to the number "2".
//         let dtmfTones=[dtmf.DTMF_0,dtmf.DTMF_1,dtmf.DTMF_2,dtmf.DTMF_3,dtmf.DTMF_4,dtmf.DTMF_5,dtmf.DTMF_6,dtmf.DTMF_7,dtmf.DTMF_8,dtmf.DTMF_9,dtmf.DTMF_S,dtmf.DTMF_P];
//         if (value<12 && value>=0)
//             dtmf.playTone(dtmfTones[value], 500);
//         dtmf.startTone(dtmfTOnes[value]);
//
// // 300ms later stop the tone.
//         setTimeout(() => {
//             dtmf.stopTone();
//         }, 300);
        // VoxImplant.SDK.sendDTMF(currentCallId, value);
    }
    receivefax(){
        if (cur_call)
            cur_call.transfer('rxfax'+logininfo.username);
        console.log('transfer to '+'rxfax'+logininfo.username);
//        logoutAfterHangup=false;
    }
    render(){
        var overwriteStyles={paddingRight:0};
        var spaceStyles={
            background:"white",
            color:"black",
            marginLeft:0,
            marginRight:0,
            // height:"900px",
        };
        return (
                <div className="row" style={spaceStyles} >
                <div className="col-xs-12 col-sm-12 col-md-6  col-lg-6" id="maillist"  style={overwriteStyles}>
                {this.renderDialer()}
                </div>
                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6" style={overwriteStyles}>
                {this.renderCallLog()}
                </div>
                </div>
         );
    }
    querycalllogCallback(tasklist){
        this.setState({waiting:false,calllist:tasklist,menuAction:'calllog'});
    }
    calllog(){
        session.user.queryfax((t)=>this.querycalllogCallback(t),10);
    }
    renderCallLog(){
        var menuitemStyles={
            // color:"black",
            marginLeft: 6,
        };
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    通话记录
                    <button  className={"btn btn-default navbar-right"} onClick={()=>this.calllog()} id="task" role="presentation" style={menuitemStyles}  onTouchEnd={()=>this.calllog()} ><span className="glyphicon glyphicon-refresh" aria-hidden="true"></span> 刷新</button>
                </Text>
                <CallList data={this.state.calllist} onRedial={(e)=>docall(e)} />
            </View>
        );
    }
    renderDialer() {
        let keypad = this.state.status != 'init'?<Keypad keyPressed={(e) => this._keypadPressed(e)} />:null;
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    CALLPASS电话
                </Text>
                <Text style={styles.info}>
                    CALLPASS可以与普通电话进行通话，通话过程中可以接收对方发送的传真。
                </Text>
                <Text style={styles.info}>
                    通话资费与发传真的资费相同。
                </Text>
                <View style={{flexDirection: 'row'}}>
                    <Text>{this.state.dtmf}</Text>
                    {/*<Text>*/}
                        {/*{this.state.isFront ? "Use front camera" : "Use back camera"}*/}
                    {/*</Text>*/}
                    {/*<TouchableHighlight*/}
                        {/*style={{borderWidth: 1, borderColor: 'black'}}*/}
                        {/*onPress={this._switchVideoType}>*/}
                        {/*<Text>Switch camera</Text>*/}
                    {/*</TouchableHighlight>*/}
                </View>
                {this.renderLogin()}
                { (this.state.status == 'ready' || this.state.status =='closed' || this.state.status =='main')?
                    (<View style={{flexDirection:'row'}}>
                        <Text style={{alignSelf: 'center'}}>电话号码：</Text>
                        <TextInput
                            ref='roomID'
                            autoCorrect={false}
                            style={{marginLeft:10,marginRight:20,width: 200, height: 40, borderColor: 'gray', borderWidth: 1}}
                            onChangeText={(text) => this.setState({roomID: text})}
                            value={this.state.roomID}
                        />
                        {/*<TouchableHighlight*/}
                            {/*onPress={this._press}>*/}
                            {/*<Text>Enter room</Text>*/}
                        {/*</TouchableHighlight>*/}
                        <Button title=' 呼叫' style={styles.loginbutton} onPress={(e) => this._press(e)}>呼叫</Button>
                    </View>) : null
                }
                {keypad}
                { (this.state.status == 'connected' || this.state.status == 'completed' || this.state.status== 'incall')?
                    (<View>
                            <Button title='挂机' style={styles.registerbutton} onPress={(e) => this.hangup(e)}>挂断</Button>
                            <Text onPress={(e)=>this.receivefax()}
                                  style={[styles.faxkeypad,{marginLeft:0,marginTop:20,fontSize:20,alignSelf:'center'}]}
                            >
                                收传真
                            </Text>
                        </View>
                    ) : null
                }
                <audio ref="webcam1" id="webcam1"  style={styles.selfView}/>
                {/*<video ref="webcam1" id="webcam1"  style={styles.selfView}/>*/}
                {
                    mapHash(this.state.remoteList, function(remote, index) {
                        return <video key={index}  style={styles.remoteView}/>
                    })
                }
                {this.state.status != 'init'?<Button title='退出' color='red' style={[styles.registerbutton,{width:100}]} onPress={(e) => this.logout(e)}>退出</Button>:null}
                {/*{this.state.status != 'init'?<Button title='TESTRING' style={[styles.registerbutton,{width:100}]} onPress={(e) => this.ring(e)}>TESTRING</Button>:null}*/}
                {/*<Text style={styles.welcome}>*/}
                    {/*{this.state.info}*/}
                {/*</Text>*/}
                <Text style={styles.welcome}>
                    {this.state.status}
                </Text>
                <Button title='客服电话' color='grey' style={[styles.registerbutton,{width:100,backgroundColor:'white',color:'black'}]} onPress={(e) => this.helpcall(e)}>客服电话</Button>
            </View>
        );
    }
};

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
    info: {
        fontSize: 14,
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
        width:100,
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
        top:5,
        marginTop:10,
        paddingVertical: 10,
        marginBottom: 10,
        width:100,
        borderRadius: 4,
        height:40,
    },
};
//});

//AppRegistry.registerComponent('sipim', () => CallApp);
module.exports = CallView;
