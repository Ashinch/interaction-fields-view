import { Breadcrumbs, Button, Grid, Loading, Page, Select, Spacer, Tabs, Text, useToasts } from '@geist-ui/react'
import { useEffect, useRef, useState } from "react"
import "../util/bee"
import { useParams } from "react-router-dom"
import { Model } from "../model/model"
import Camera from "../component/camera"
import { Codepen, Edit, PlayFill } from '@geist-ui/react-icons'

import { Controlled as CodeMirror } from "react-codemirror2"
import "codemirror/lib/codemirror"
import "codemirror/lib/codemirror.css"
import "codemirror/theme/idea.css"
import 'codemirror/addon/selection/active-line'

import 'codemirror/addon/fold/foldgutter.css' // 折叠
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'

import 'codemirror/addon/hint/show-hint.css' // start-ctrl+空格代码提示补全
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/anyword-hint.js' // e
import 'codemirror/mode/javascript/javascript' //语言
import 'codemirror/mode/markdown/markdown' //语言
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/perl/perl.js'
import 'codemirror/mode/clike/clike.js'

let socket = null
let pc = null
let rtcStream = null
let editChange = null
let codeMirrorRef = null
let otherCameraRef = null
let oneselfCameraRef = null
let languageChange = null
let isCreator

// stun和turn服务器
const iceServer = {
  "iceServers": [{
    "url": "stun:stun.l.google.com:19302"
  }, {
    "url": "turn:numb.viagenie.ca",
    "username": "webrtc@live.com",
    "credential": "muazkh"
  }]
}

const rtcEvent = {
  // newUser: "new_user",
  iceCandidate: "_ice_candidate",
  offer: "_offer",
  answer: "_answer",
  micChange: "mic_change",
  cameraChange: "camera_change",
  editChange: "edit_change",
  languageChange: "language_change"
}

const send = (event, data) => {
  socket.send(JSON.stringify({
    "event": event,
    "data": data
  }))
  console.log(`发送 ${event}`)
}

const socketInit = (code) => {
  socket = new WebSocket(`wss://192.168.119.65:10004/webrtc?code=${code}&access_token=${Model.session.getInfo()?.jwt?.access_token}`)

  socket.onopen = function () {
    // if (isCreator == null) {
    //   if (socket.readyState === 1) {
    //     send(rtcEvent.newUser)
    //   }
    // }
  }


  //处理到来的信令
  socket.onmessage = function (event) {
    console.log('接收: ', event)
    const json = JSON.parse(event.data)

    switch (json.event) {
      case rtcEvent.newUser:
        // location.reload()
        break
      case rtcEvent.iceCandidate:
        pc && pc.addIceCandidate(new RTCIceCandidate(json.data.candidate))
        break
      case rtcEvent.micChange:
        otherCameraRef.current?.setMicOff(json.data)
        break
      case rtcEvent.cameraChange:
        otherCameraRef.current?.setCameraOff(json.data)
        break
      case rtcEvent.editChange:
        if (json.data.origin === '+input' || json.data.origin === 'paste' || json.data.origin === '+delete' || json.data.origin === 'undo') {
          codeMirrorRef?.current?.editor.doc.replaceRange(json.data.text, json.data.from, json.data.to)
        }
        break
      case rtcEvent.languageChange:
        languageChange(json.data, false)
        break
      default:
        pc && pc.setRemoteDescription(new RTCSessionDescription(json.data.sdp)).catch((error) => console.error('Failure callback: ' + error))
        if (json.event === rtcEvent.offer) {
          pc && pc.createAnswer((desc) => {
            pc.setLocalDescription(desc)
            if (socket.readyState === 1) {
              send(rtcEvent.answer, {"sdp": desc})
            }
          }, (e) => console.error(`createAnswer: ${e}`))
        }
    }
  }
}

const pcInit = () => {
  pc = new RTCPeerConnection(iceServer)

  // 发送ICE候选到其他客户端
  pc.onicecandidate = function (event) {
    if (event.candidate !== null) {
      if (socket.readyState === 1) {
        send(rtcEvent.iceCandidate, {"candidate": event.candidate})
      }
    }
  }

  // 如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
  pc.onaddstream = function (event) {
    console.log("检测到媒体流连接到本地")
    otherCameraRef.current?.setStream(event.stream)
  }
}

const mediaInit = () => {
// 获取本地音频和视频流
//   navigator.getWebcam = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.moxGetUserMedia ||
//     navigator.mozGetUserMedia || navigator.msGetUserMedia)
  navigator.getUserMedia({
      // audio: true,
      video: {width: 300, height: 300}
    },
    (stream) => {
      rtcStream = stream
      //绑定本地媒体流到video标签用于输出
      oneselfCameraRef.current?.setStream(stream)
      //向PeerConnection中加入需要发送的流
      pc.addStream(stream)
      //如果是发起方则发送一个offer信令
      if (isCreator != null) {
        pc.createOffer((desc) => {
          // 发送offer和answer的函数，发送本地session描述
          pc.setLocalDescription(desc)
          if (socket.readyState === 1) {
            send(rtcEvent.offer, {"sdp": desc})
          }
        }, (e) => console.error(`createOffer: ${e}`))
      }
    }, (error) => {
      //处理媒体流创建失败错误
      console.log('getUserMedia error: ' + error)
    })
}


const Fields = () => {
  const {code} = useParams()
  const [loading, setLoading] = useState(true)
  const [editValue, setEditValue] = useState("")
  const [codeStatus, setCodeStatus] = useState()
  const [language, setLanguage] = useState("text/x-java")
  const [toasts, setToast] = useToasts()

  otherCameraRef = useRef()
  oneselfCameraRef = useRef()
  codeMirrorRef = useRef()
  const codeDivRef = useRef()

  useEffect(() => {
    setLoading(true)
    Model.meeting.codeStatus({
      code: code
    }).then((res) => {
      console.log("then", res)
      setCodeStatus(res.data)
      setLoading(false)
      isCreator = Model.session.isMe(res.data.creatorUUID)
      !socket && socketInit(code)
      !pc && pcInit()
      !rtcStream && mediaInit()

    }).catch((err) => {
      console.log("catch", err)
      setToast({text: `${err.msg}`, type: "error", delay: 99999})
    })

    return () => {
      socket && socket.close()
      pc && pc.close()
      rtcStream && console.log(rtcStream.getTracks())
      rtcStream && rtcStream.getTracks().forEach(i => i.stop())
    }
  }, [])

  const onMicChange = () => {
    rtcStream.getAudioTracks().forEach(i => i.enabled = oneselfCameraRef.current?.micOff)
    if (socket.readyState === 1) {
      send(rtcEvent.micChange, !oneselfCameraRef.current?.micOff)

    }
  }

  const onCameraChange = () => {
    rtcStream.getVideoTracks().forEach(i => i.enabled = oneselfCameraRef.current?.cameraOff)
    if (socket.readyState === 1) {
      send(rtcEvent.cameraChange, !oneselfCameraRef.current?.cameraOff)
    }
  }

  const onRunClick = () => {
    const selectedValue = codeMirrorRef?.current?.editor.getSelection()
    if (Bee.StringUtils.isBlank(selectedValue)) {
      setToast({text: "请选出要运行的代码", type: "error"})
      return
    }
    console.log(codeDivRef.current?.clientWidth, codeDivRef.current?.clientHeight)
  }

  editChange = (editor, data, value) => {
    console.log(data)
    setEditValue(value)
    socket && send(rtcEvent.editChange, data)
  }

  languageChange = (e, isSend = true) => {
    setLanguage(e)
    if (socket.readyState === 1) {
      isSend && send(rtcEvent.languageChange, e)
    }
  }

  return loading ? <Loading /> : (
    <Page dotBackdrop>
      <Page.Header>
        <Breadcrumbs>
          <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Item>Fields</Breadcrumbs.Item>
        </Breadcrumbs>
      </Page.Header>
      <Page.Content>
        <Grid.Container className="interaction-board" style={{width: "100%", height: "100%"}} direction={"row"}>
          <Grid.Container className="editor">
            <Grid.Container alignItems={"center"} direction={"row"} justify={"space-between"}>
              <Text h3>TT的会议</Text>
              <div style={{display: "flex", flexDirection: "row"}}>
                <Select width="40px" height="40px" onChange={languageChange} value={language}>
                  <Select.Option value="text">纯文本</Select.Option>
                  <Select.Option value="markdown">Markdown</Select.Option>
                  <Select.Option value="text/x-java">Java</Select.Option>
                  <Select.Option value="text/x-csrc">C</Select.Option>
                  <Select.Option value="text/x-c++src">C++</Select.Option>
                  <Select.Option value="text/javascript">JavaScript</Select.Option>
                  <Select.Option value="text/x-cython">Python</Select.Option>
                </Select>
                <Spacer w={1} />
                <Button auto type="success-light" shadow iconRight={<PlayFill />} onClick={onRunClick}>运行</Button>
              </div>
            </Grid.Container>
            <Spacer h={1} />
            <Grid>
              <Tabs initialValue="1">
                <Tabs.Item label={<><Codepen />交互板</>} value="1" height="50px">
                  <Spacer h={1} />
                  <div id="ss" ref={codeDivRef} style={{display: "flex", flex: "1"}}>
                    <CodeMirror
                      ref={codeMirrorRef}
                      value={editValue}
                      options={{
                        lineNumbers: true,
                        mode: {name: language},
                        extraKeys: {"Alt": "autocomplete"},
                        autofocus: true,
                        styleActiveLine: true,
                        lineWrapping: true,
                        foldGutter: true,
                        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                        scrollbarStyle: "native",
                        fixedGutter: true,
                        coverGutterNextToScrollbar: false
                      }}
                      onBeforeChange={editChange}
                      spellcheck
                      editorDidMount={(editor) => {
                        console.log(document.getElementById("ss").clientWidth)
                        editor.setSize(document.getElementById("ss").clientWidth, document.getElementById("ss").clientHeight)
                      }}
                    />
                  </div>
                </Tabs.Item>
                <Tabs.Item label={<><Edit />笔记</>} value="2" height="50px">
                  <Spacer h={1} />
                  <div style={{maxWidth: 951, maxHeight: 700}}>
                    {/*<CodeMirror*/}
                    {/*  value="这里输入的文本仅自己可见"*/}
                    {/*  style={{height: "auto"}}*/}
                    {/*  options={{*/}
                    {/*    lineNumbers: true,*/}
                    {/*    mode: {name: "text"},*/}
                    {/*    autofocus: true,*/}
                    {/*    styleActiveLine: true,*/}
                    {/*    lineWrapping: true,*/}
                    {/*  }}*/}
                    {/*  onBeforeChange={editChange}*/}
                    {/*  spellcheck="true"*/}
                    {/*  editorDidMount={(editor) => {*/}
                    {/*    editor.setSize("951", "700")*/}
                    {/*  }}*/}
                    {/*/>*/}
                  </div>
                </Tabs.Item>
              </Tabs>
            </Grid>
          </Grid.Container>
          <Spacer w={2} />
          <Grid className="extra">
            <h3>信息</h3>
            <Text>输出</Text>
            <div className="camera" style={{borderRadius: 50}}>
              {Model.session.isMe(codeStatus?.creatorUUID) ? (<>
                <Camera ref={oneselfCameraRef}
                        isOneself onMicChange={onMicChange}
                        onCameraChange={onCameraChange} />
                <Camera ref={otherCameraRef} />
              </>) : (<>
                <Camera ref={otherCameraRef} />
                <Camera ref={oneselfCameraRef}
                        isOneself onMicChange={onMicChange}
                        onCameraChange={onCameraChange} />
              </>)}
            </div>
          </Grid>
        </Grid.Container>
      </Page.Content>
      <Page.Footer>

      </Page.Footer>
      <style jsx="true">{`
        .interaction-board {
        }

        .editor {
          flex: 2;
          display: flex;
          flex-direction: column;
          background: white;
          padding: 24px;
          box-shadow: rgba(0, 0, 0, 0.12) 0 30px 60px;
          border-radius: 5px;
        }

        .extra {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          padding: 24px;
          box-shadow: rgba(0, 0, 0, 0.12) 0 30px 60px;
          border-radius: 5px;
        }

        .camera {
          //display: flex;
          //flex-direction: column;
          //justify-content: center;
          //align-items: center;
          //background: lightskyblue;
          //box-shadow: rgba(0, 0, 0, 0.12) 0px 30px 30px;
          border-radius: 5px;
        }
      `}</style>
    </Page>
  )
}

export default Fields
