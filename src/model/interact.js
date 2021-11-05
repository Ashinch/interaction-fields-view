let ws
let pc
let rtcStream
let statsInterval
let isConnected = true

// stun和turn服务器
export const iceServer = {
  "iceServers": [{
    "url": "stun:stun.l.google.com:19302"
  }, {
    "url": "turn:numb.viagenie.ca",
    "username": "webrtc@live.com",
    "credential": "muazkh"
  }]
}

export const rtcEvent = {
  connected: "connected",
  iceCandidate: "iceCandidate",
  offer: "offer",
  answer: "answer",
  micChange: "micChange",
  cameraChange: "cameraChange",
  ack: "ack",
  join: "join",
  quit: "quit",
  cursorChange: "cursorChange",
  languageChange: "languageChange",
  judgeResultReceive: "judgeResultReceive",
  operation: "operation",
  remind: "remind",
  hidden: "hidden",
  note: "note",
}

export const interactInit = ({
                               url,
                               isCreator,
                               cameraDeviceID,
                               onConnected,
                               onDisconnected,
                               onAddSelfStream,
                               onAddOtherStream,
                               onOtherMicChange,
                               onOtherCameraChange,
                               onOperation,
                               onRemind,
                               onHidden,
                               onACK,
                               onJoin,
                               onQuit,
                               onOtherCursorChange,
                               onOtherLanguageChange,
                               onJudgeResultReceive,
                               onStats,
                             }) => {
  ws = new WebSocket(url)
  //MozWebSocket


  // socket.onopen = () => onOpen && onOpen()

  //处理到来的信令
  ws.onmessage = (event) => {
    console.info('Received: ', JSON.parse(event.data))
    const json = JSON.parse(event.data)
    switch (json.event) {
      case rtcEvent.connected:
        onConnected && onConnected(json)
        break
      case rtcEvent.iceCandidate:
        pc && pc.addIceCandidate(new RTCIceCandidate(json.data.candidate))
        break
      case rtcEvent.micChange:
        onOtherMicChange && onOtherMicChange(json)
        break
      case rtcEvent.cameraChange:
        onOtherCameraChange && onOtherCameraChange(json)
        break
      case rtcEvent.operation:
        onOperation && onOperation(json)
        break
      case rtcEvent.remind:
        onRemind && onRemind(json)
        break
      case rtcEvent.hidden:
        onHidden && onHidden(json)
        break
      case rtcEvent.ack:
        onACK && onACK(json)
        break
      case rtcEvent.join:
        onJoin && onJoin(json)
        break
      case rtcEvent.quit:
        onQuit && onQuit(json)
        break
      case rtcEvent.cursorChange:
        onOtherCursorChange && onOtherCursorChange(json)
        break
      case rtcEvent.languageChange:
        onOtherLanguageChange && onOtherLanguageChange(json)
        break
      case rtcEvent.judgeResultReceive:
        onJudgeResultReceive && onJudgeResultReceive(json)
        break
      default:
        pc && pc.setRemoteDescription(new RTCSessionDescription(json.data.sdp)).catch((error) => console.error('Failure callback: ' + error))
        // if (json.event === rtcEvent.offer) {
        pc && pc.createAnswer((desc) => {
          pc.setLocalDescription(desc)
          isWSReady() && send(rtcEvent.answer, {"sdp": desc})
        }, (e) => console.error(`createAnswer: ${e}`))
      // }
    }
  }

  ws.onerror = (event) => {
    console.log("onerror", event)
    isConnected = false
    onDisconnected && onDisconnected(event)
  }

  pc = new RTCPeerConnection(iceServer)

  pc.onicecandidate = (event) => {
    if (event.candidate !== null) {
      isWSReady() && send(rtcEvent.iceCandidate, {"candidate": event.candidate})
    }
  }

  // 如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
  pc.onaddstream = (event) => {
    console.info("onAddOtherStream")
    onAddOtherStream && onAddOtherStream(event.stream)
    let bytesPrev = 0
    let bytesTimestampPrev = 0
    let delayTimestampPrev = 0

    let bitrate
    let delay
    clearInterval(statsInterval)
    statsInterval = setInterval(() => {
      pc.getStats(null).then(stats => {
        stats.forEach(report => {
          const now = report.timestamp

          if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
            const bytes = report.bytesSent
            if (bytesTimestampPrev) {
              bitrate = (bytes - bytesPrev) / (now - bytesTimestampPrev)
              bitrate = Math.floor(bitrate)
            }
            bytesPrev = bytes
            bytesTimestampPrev = now
          }

          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            if (delayTimestampPrev) {
              delay = now - delayTimestampPrev
            }
            delayTimestampPrev = now
          }

          onStats && onStats({
            bitrate: bitrate,
            delay: delay
          })
        })
      })
    }, 1000)
  }

  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia

  navigator.getUserMedia({
      audio: true,
      video: {
        width: 289,
        height: 289,
        deviceId: cameraDeviceID
      },
    },
    (stream) => {
      if (!isConnected) return
      console.info("onAddSelfStream")
      rtcStream = stream
      onSelfMicChange(false)
      onAddSelfStream && onAddSelfStream(stream)
      pc.addStream(stream)
      //如果是发起方则发送一个offer信令
      // if (isCreator != null && !isCreator) {
      pc.createOffer((desc) => {
        // 发送offer和answer的函数，发送本地session描述
        pc.setLocalDescription(desc)
        isWSReady() && send(rtcEvent.offer, {"sdp": desc})
      }, (e) => console.error("PC createOffer is error: ", e))
      // }
    }, (error) => {
      //处理媒体流创建失败错误
      console.error('Call user media is error: ' + error)
    })
}

export const send = (event, data) => {
  isWSReady() && ws.send(JSON.stringify({
    "event": event,
    "data": data
  }))
  console.info("Send", event)
}

export const onSelfMicChange = (enabled) => {
  rtcStream && rtcStream.getAudioTracks().forEach(i => i.enabled = enabled)
  send(rtcEvent.micChange, !enabled)
}

export const onSelfCameraChange = (enabled) => {
  rtcStream && rtcStream.getVideoTracks().forEach(i => i.enabled = enabled)
  send(rtcEvent.cameraChange, !enabled)
}

export const isWSReady = () => {
  return ws && ws.readyState === 1
}

export const interactClose = () => {
  ws && ws.close()
  pc && pc.close()
  rtcStream && console.info("RTC close", rtcStream.getTracks())
  rtcStream && rtcStream.getTracks().forEach(i => i.stop())
}

export const getDevices = (callback) => {
  navigator.mediaDevices.enumerateDevices()
    .then(function (devices) {
      callback && callback(devices)
    })
}
