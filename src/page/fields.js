import {
  Page,
  Text,
  Image,
  Display,
  Button,
  Grid,
  Input,
  Divider,
  Spacer,
  Textarea,
  Loading,
  useToasts, Tabs, Select, Breadcrumbs
} from '@geist-ui/react'
import { createRef, useEffect, useRef, useState } from "react"
import "../util/bee"
import { useParams, useRouteMatch } from "react-router-dom"
import { Session } from "../model/session"
import { Model } from "../model/model"
import Camera from "../component/Camera/camera"
import { Codepen, Edit, PlayFill } from '@geist-ui/react-icons'

import Prosemirror from 'react-prosemirror-editor-x'
import 'react-prosemirror-editor-x/dist/index.css'

let socket = null
let pc = null
let rtcStream = null
let editChange = null
let otherCameraRef = null
let oneselfCameraRef = null

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
  newUser: "new_user",
  iceCandidate: "_ice_candidate",
  offer: "_offer",
  answer: "_answer",
  micChange: "mic_change",
  cameraChange: "camera_change",
  editChange: "edit_change",
}

const send = (event, data) => {
  socket.send(JSON.stringify({
    "event": event,
    "data": data
  }))
  console.log(`发送 ${event}`)
}

const socketInit = (code) => {
  socket = new WebSocket(`wss://192.168.1.128:10004/webrtc?code=${code}&access_token=${Model.session.getInfo()?.jwt?.access_token}`)

  socket.onopen = function () {
    if (isCreator == null) {
      send(rtcEvent.newUser)
    }
  }


  //处理到来的信令
  socket.onmessage = function (event) {
    console.log('接收: ', event)
    const json = JSON.parse(event.data)

    switch (json.event) {
      case rtcEvent.newUser:
        location.reload()
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
        editChange && editChange(json.data)
        break
      default:
        pc && pc.setRemoteDescription(new RTCSessionDescription(json.data.sdp)).catch((error) => console.error('Failure callback: ' + error))
        if (json.event === rtcEvent.offer) {
          pc && pc.createAnswer((desc) => {
            pc.setLocalDescription(desc)
            send(rtcEvent.answer, {"sdp": desc})
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
      send(rtcEvent.iceCandidate, {"candidate": event.candidate})
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
          send(rtcEvent.offer, {"sdp": desc})
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
  const [editValue, setEditValue] = useState()
  const [codeStatus, setCodeStatus] = useState()
  const [toasts, setToast] = useToasts()

  otherCameraRef = useRef()
  oneselfCameraRef = useRef()

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
    send(rtcEvent.micChange, !oneselfCameraRef.current?.micOff)
  }

  const onCameraChange = () => {
    rtcStream.getVideoTracks().forEach(i => i.enabled = oneselfCameraRef.current?.cameraOff)
    send(rtcEvent.cameraChange, !oneselfCameraRef.current?.cameraOff)
  }

  editChange = (e, isSend) => {
    setEditValue(e)
    isSend && send(rtcEvent.editChange, e)
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
                <Select initialValue="1" width="40px" height="40px">
                  <Select.Option value="1">纯文本</Select.Option>
                  <Select.Option value="2">Java</Select.Option>
                  <Select.Option value="3">C++</Select.Option>
                </Select>
                <Spacer w={1} />
                <Button auto type="success-light" shadow iconRight={<PlayFill />}>运行</Button>
              </div>
            </Grid.Container>
            <Spacer h={1} />
            <Grid>
              <Tabs initialValue="1">
                <Tabs.Item label={<><Codepen />交互板</>} value="1" height="50px">
                  <Spacer h={1} />
                  {/*<Textarea placeholder="请输入一段描述。" width="100%" height="600px"*/}
                  {/*          value={editValue}*/}
                  {/*          onChange={(e) => editChange(e.target.value, true)} />*/}
                  {/*<div id="editor"/>*/}
                  <Prosemirror/>
                </Tabs.Item>
                <Tabs.Item label={<><Edit />笔记</>} value="2" height="50px">

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
