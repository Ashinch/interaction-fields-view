import { IntQueue } from "../util/queue"

let ws
let pc
let rtcStream
let statsInterval
let heartbeatInterval
let isConnected = true
let audioContext = new AudioContext()
let gainNode = audioContext.createGain()
let heartbeats = new IntQueue(10)

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
  close: "close",
  cursorChange: "cursorChange",
  languageChange: "languageChange",
  judgeResultReceive: "judgeResultReceive",
  operation: "operation",
  pullDocument: "pullDocument",
  pullNote: "pullNote",
  remind: "remind",
  hidden: "hidden",
  note: "note",
  heartbeat: "heartbeat",
}

export const interactInit = ({
                               url,
                               isCreator,
                               onConnected,
                               onDisconnected,
                               onRemoveDuplicateConnection,
                               onHeartbeatDelay,
                               onAddSelfStream,
                               onAddOtherStream,
                               onOtherMicChange,
                               onOtherCameraChange,
                               onOperation,
                               onPullDocument,
                               onPullNote,
                               onRemind,
                               onHidden,
                               onACK,
                               onJoin,
                               onQuit,
                               onClose,
                               onOtherCursorChange,
                               onOtherLanguageChange,
                               onJudgeResultReceive,
                               onStats,
                             }) => {
  ws = new WebSocket(url)
  //MozWebSocket

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
      case rtcEvent.pullDocument:
        onPullDocument && onPullDocument(json)
        break
      case rtcEvent.pullNote:
        onPullNote && onPullNote(json)
        break
      case rtcEvent.remind:
        onRemind && onRemind(json)
        break
      case rtcEvent.hidden:
        onHidden && onHidden(json)
        break
      case rtcEvent.heartbeat:
        heartbeats.enqueue((new Date().getTime() - json.data) / 2)
        onHeartbeatDelay && onHeartbeatDelay(Math.round(heartbeats.sum() / heartbeats.size()))
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
      case rtcEvent.close:
        onClose && onClose(json)
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
        console.log("signalingState", pc.signalingState)
        // if (pc.signalingState === "stable") {
          pc && pc.createAnswer((desc) => {

            pc.setLocalDescription(desc)
            isWSReady() && interactSend(rtcEvent.answer, {"sdp": desc})
          }, (e) => console.error(`createAnswer: ${e}`))
        // }
    }
  }

  ws.onerror = (event) => {
  }

  ws.onclose = (event) => {
    isConnected = false
    clearInterval(heartbeatInterval)
    switch (event.code) {
      case 3000:
        // 主动关闭，不再重连
        break
      case 1013:
        // 重复连接被清除，不再重连
        onRemoveDuplicateConnection && onRemoveDuplicateConnection()
        break
      default:
        onDisconnected && onDisconnected(event)
    }
  }

  ws.onopen = (event) => {
  }

  heartbeatInterval = setInterval(() => {
    let time = new Date().getTime()
    interactSend(rtcEvent.heartbeat, time)
  }, 3000)

  pc = new RTCPeerConnection(iceServer)

  pc.onicecandidate = (event) => {
    if (event.candidate !== null) {
      isWSReady() && interactSend(rtcEvent.iceCandidate, {"candidate": event.candidate})
    }
  }

  // 如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
  pc.onaddstream = (event) => {
    console.info("onAddOtherStream", event.stream)
    onAddOtherStream && onAddOtherStream(event.stream)
    let upstreamBytesPrev = 0
    let upstreamBytesTimestampPrev = 0
    let downstreamBytesPrev = 0
    let downstreamBytesTimestampPrev = 0

    let upstream
    let downstream
    let delay
    clearInterval(statsInterval)
    statsInterval = setInterval(() => {
      pc.getStats(null).then(stats => {
        stats.forEach(report => {
          const now = report.timestamp

          if (report.type === "remote-inbound-rtp") {
            delay = report.roundTripTime * 1000
          }
          if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
            const bytes = report.bytesSent
            if (upstreamBytesTimestampPrev) {
              upstream = (bytes - upstreamBytesPrev) / (now - upstreamBytesTimestampPrev)
              upstream = Math.floor(upstream)
            }
            upstreamBytesPrev = bytes
            upstreamBytesTimestampPrev = now
          }

          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            const bytes = report.bytesReceived
            if (downstreamBytesTimestampPrev) {
              downstream = (bytes - downstreamBytesPrev) / (now - downstreamBytesTimestampPrev)
              downstream = Math.floor(downstream)
            }
            downstreamBytesPrev = bytes
            downstreamBytesTimestampPrev = now
          }

          onStats && onStats({
            upstream: upstream,
            downstream: downstream,
            delay: delay
          })
        })
      })
    }, 1000)
  }


  getCamera("", onAddSelfStream)
}

export const interactSend = (event, data) => {
  isWSReady() && ws.send(JSON.stringify({
    "event": event,
    "data": data
  }))
  if (event !== event.heartbeat) {
    console.info("Send", event, data)
  }
}

export const onSelfMicChange = (enabled) => {
  rtcStream && rtcStream.getAudioTracks().forEach(i => i.enabled = enabled)
  interactSend(rtcEvent.micChange, !enabled)
}

export const onSelfCameraChange = (enabled) => {
  rtcStream && rtcStream.getVideoTracks().forEach(i => i.enabled = enabled)
  interactSend(rtcEvent.cameraChange, !enabled)
}

export const isWSReady = () => {
  return ws && ws.readyState === 1
}

export const interactClose = (code = 3000) => {
  ws && ws.close(code)
  pc && pc.close()
  rtcStream && console.info("RTC close", rtcStream.getTracks())
  rtcStream && rtcStream.getTracks().forEach(i => i.stop())
}

export const getCamera = (deviceId, onAddSelfStream) => {
  rtcStream && rtcStream.getTracks().forEach(i => i.stop())
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
        deviceId: deviceId
      },
    },
    (stream) => {
      if (!isConnected) return
      // audioContext = new AudioContext()
      // gainNode = audioContext.createGain();
      // let audioSource = audioContext.createMediaStreamSource(stream);
      // let audioDestination = audioContext.createMediaStreamDestination();
      // audioSource.connect(gainNode);
      // gainNode.connect(audioDestination);
      // gainNode.gain.value = 1;
      // console.log("audioDestination", audioDestination)
      // rtcStream = audioDestination.stream
      rtcStream = stream
      onSelfMicChange(false)

      onAddSelfStream && onAddSelfStream(rtcStream)
      if (pc.connectionState === "connected" || pc.connectionState === "connecting") {
        const videoSenders = pc.getSenders().filter((sender) => sender.track.kind === "video")
        videoSenders[0].replaceTrack(rtcStream.getVideoTracks()[0])
      } else {
        pc.addStream(rtcStream)
        pc.createOffer((desc) => {
          // 发送offer和answer的函数，发送本地session描述
          pc.setLocalDescription(desc)
          isWSReady() && interactSend(rtcEvent.offer, {"sdp": desc})
        }, (e) => console.error("PC createOffer is error: ", e))
      }
    }, (error) => {
      //处理媒体流创建失败错误
      console.error('Call user media is error: ' + error)
    })
}

export const getDevices = (callback) => {
  navigator.mediaDevices.enumerateDevices()
    .then(function (devices) {
      callback && callback(devices)
    })
}

export const changeVolume = (e) => {
  console.log("changeVolume", e)
  gainNode.gain.value = e
}
