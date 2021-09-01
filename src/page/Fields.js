import { Page, Text, Image, Display, Button, Grid, Input, Divider, Spacer, Textarea } from '@geist-ui/react'
import { useEffect, useState } from "react"
import "../util/bee"
import { useParams, useRouteMatch } from "react-router-dom"
import { Session } from "../model/Session"
import { Model } from "../model/Model"

let socket = null
let pc = null
let rtcStream = null
let editChange = null

const isCaller = window.location.href.split('#')[1]

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
  editChange: "edit_change",
}

// 创建PeerConnection实例 (参数为null则没有iceserver，即使没有stunserver和turnserver，仍可在局域网下通讯)
// var pc = new webkitRTCPeerConnection(null);


const send = (event, data) => {
  socket.send(JSON.stringify({
    "event": event,
    "data": data
  }))
  console.log(`发送 ${event}`)
}

const socketInit = (code) => {
  socket = new WebSocket(`wss://192.168.1.100:10004/webrtc?code=${code}&access_token=${Model.session.getInfo()?.jwt?.access_token}`)

  socket.onopen = function () {
    if (isCaller == null) {
      send(rtcEvent.newUser)
    }
  }


  //处理到来的信令
  socket.onmessage = function (event) {
    console.log('接收: ', event)
    const json = JSON.parse(event.data)
    if (json.event === "new_user") {
      location.reload()
    } else if (json.event === rtcEvent.editChange) {
      editChange && editChange(json.data)
    } else if (json.event === "_ice_candidate") {
      //如果是一个ICE的候选，则将其加入到PeerConnection中，
      pc && pc.addIceCandidate(new RTCIceCandidate(json.data.candidate))
    } else {
      //否则设定对方的session描述为传递过来的描述
      pc && pc.setRemoteDescription(new RTCSessionDescription(json.data.sdp)).catch((error) => console.error('Failure' +
        ' callback: ' + error))
      // 如果是一个offer，那么需要回复一个answer
      if (json.event === "_offer") {
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
    document.getElementById('vid2') && (document.getElementById('vid2').srcObject = event.stream)
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
      document.getElementById('vid1') && (document.getElementById('vid1').srcObject = stream)
      //向PeerConnection中加入需要发送的流
      pc.addStream(stream)
      //如果是发起方则发送一个offer信令
      if (isCaller != null) {
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
  let showAudio = true
  let showVideo = true
  const {code} = useParams()
  const [audioEnabled, setAudioEnabled] = useState(showAudio)
  const [videoEnabled, setVideoEnabled] = useState(showVideo)
  const [editValue, setEditValue] = useState()

  useEffect(() => {
    console.log(code)
    !socket && socketInit(code)
    !pc && pcInit()
    !rtcStream && mediaInit()

    return () => {
      socket && socket.close()
      pc && pc.close()
      console.log(rtcStream.getTracks())
      rtcStream && rtcStream.getTracks().forEach(i => i.stop())
    }
  }, [])

  const closeAudio = () => {
    rtcStream.getAudioTracks().forEach(i => i.enabled = !audioEnabled)
    setAudioEnabled(!audioEnabled)
  }

  const closeVideo = () => {
    rtcStream.getVideoTracks().forEach(i => i.enabled = !videoEnabled)
    setVideoEnabled(!videoEnabled)
  }

  editChange = (e, isSend) => {
    setEditValue(e)
    isSend && send(rtcEvent.editChange, e)
  }

  return (
    <Page dotBackdrop padding={0}>
      <Grid.Container width="100%" height="100px" alignItems="center" gap={1}>
        <Grid justify="center">
          <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <video id="vid2" autoPlay style={{
              backgroundColor: "blue",
              width: "300px",
              height: "300px",
              border: "2px solid blue",
              borderRadius: 5
            }} />
            <Spacer h={.5} />
            <video id="vid1" autoPlay muted style={{
              backgroundColor: "red",
              width: "300px",
              height: "300px",
              border: "2px solid red",
              borderRadius: 5
            }} />
          </div>
          <Spacer h={5} />
          <Button shadow type="secondary"
                  onClick={closeVideo}>{videoEnabled ? "关闭" : "开启"}摄像头</Button>
          <Spacer h={2} />
          <Button shadow type="secondary"
                  onClick={closeAudio}>{audioEnabled ? "关闭" : "开启"}麦克风</Button>
          <Spacer h={1} />
        </Grid>
        <Grid justify="center" style={{height: "100%"}}>
          <Textarea placeholder="请输入一段描述。" style={{flexGrow: 1, width: "100%", height: "100%"}} value={editValue}
                    onChange={(e) => editChange(e.target.value, true)} />
        </Grid>
      </Grid.Container>
    </Page>
  )
}

export default Fields
