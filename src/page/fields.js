import {
  Button,
  Description,
  Divider,
  Grid,
  Link,
  Loading,
  Modal,
  Page,
  Popover,
  Select,
  Spacer,
  Spinner,
  Table,
  Tabs,
  Text,
  Tooltip,
  useToasts
} from '@geist-ui/react'
import { Clock, Codepen, FileText, PlayFill } from "@geist-ui/react-icons"
import { useEffect, useRef, useState } from "react"
import "../util/bee"
import { useHistory, useParams } from "react-router-dom"
import { Model } from "../model/model"
import { CameraView } from "../component/cameraView"


import {
  interactClose,
  interactInit,
  interactSend,
  onSelfCameraChange,
  onSelfMicChange,
  rtcEvent
} from "../model/interact"
import { CompileRecord } from "../component/compileRecord"
import { editorLang, InteractBoard, placeholder } from "../component/interactBoard"
import TextOperation from "../util/text-operation"
import Client from "../util/client"
import { Header } from "../component/header"
import Activity from "@geist-ui/react-icons/activity"
import Wifi from "@geist-ui/react-icons/wifi"
import Infinity from "@geist-ui/react-icons/infinity"
import Power from "@geist-ui/react-icons/power"
import { getRandomColor } from "../util/hash"

let client
let cursorChangeTimeout
let remindInterval
let connectInterval
let createAtInterval
let userJoinPage

const Fields = () => {
  const history = useHistory()
  const {code} = useParams()
  const [loading, setLoading] = useState(false)
  const [meetingStatus, setMeetingStatus] = useState({
    title: "",
  })
  const [duration, setDuration] = useState()
  const [isConnected, setConnected] = useState(false)
  const [heartbeatDelay, setHeartbeatDelay] = useState()
  const [userJoin, setUserJoin] = useState(null)
  const [remind, setRemind] = useState("设定提醒")
  const [bitrate, setBitrate] = useState()
  const [delay, setDelay] = useState()
  const [typeID, setTypeID] = useState(1)
  const [language, setLanguage] = useState(editorLang[typeID])
  const [isRun, setIsRun] = useState(false)
  const [canRun, setCanRun] = useState(true)
  const [showEnv, setShowEnv] = useState(false)
  const [showReconnect, setShowReconnect] = useState(false)
  const [showRemindLoading, setRemindLoading] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [noteValue, setNoteValue] = useState("# 会议笔记\n\n> 这里输入的文本仅自己可见（支持Markdown语法高亮）\n\n")
  const [toasts, setToast] = useToasts()

  const otherCameraRef = useRef()
  const selfCameraRef = useRef()
  const interactBoard = useRef()
  const headerRef = useRef()

  useEffect(() => {
    if (!Model.session.isLogin()) {
      headerRef?.current?.showLogin()
    } else {
      connect((res) => {
        window.addEventListener('visibilitychange', () => {
          if (document.hidden && !Model.session.isMe(res.data.creatorUUID)) {
            interactSend(rtcEvent.hidden, null)
          }
        })

        // window.onbeforeunload = (e) => {
        //   e.returnValue = "确定离开当前页面吗？"
        // }
      })
    }

    return () => {
      interactClose()
      window.removeEventListener('visibilitychange', () => {
      })
    }
  }, [])

  const onAddSelfStream = (stream) => {
    selfCameraRef.current?.setStream(stream)
  }

  const onAddOtherStream = (stream) => {
    otherCameraRef.current?.setStream(stream)
  }

  let cmpPos = (a, b) => {
    if (a.line < b.line) {
      return -1
    }
    if (a.line > b.line) {
      return 1
    }
    if (a.ch < b.ch) {
      return -1
    }
    if (a.ch > b.ch) {
      return 1
    }
    return 0
  }

  let posEq = (a, b) => {
    return cmpPos(a, b) === 0
  }
  let posLe = (a, b) => {
    return cmpPos(a, b) <= 0
  }

  let minPos = (a, b) => {
    return posLe(a, b) ? a : b
  }
  let maxPos = (a, b) => {
    return posLe(a, b) ? b : a
  }


  const init = ({url, isCreator, cameraDeviceID}) =>
    interactInit({
      url: url,
      isCreator: isCreator,
      cameraDeviceID: cameraDeviceID,
      onConnected: onConnected,
      onDisconnected: onDisconnected,
      onRemoveDuplicateConnection: onRemoveDuplicateConnection,
      onHeartbeatDelay: onHeartbeatDelay,
      onAddSelfStream: onAddSelfStream,
      onAddOtherStream: onAddOtherStream,
      onOtherMicChange: onOtherMicChange,
      onOtherCameraChange: onOtherCameraChange,
      onOperation: onOperation,
      onRemind: onRemind,
      onHidden: onHidden,
      onACK: onACK,
      onJoin: onJoin,
      onQuit: onQuit,
      onOtherCursorChange: onOtherCursorChange,
      onOtherLanguageChange: onOtherLanguageChange,
      onJudgeResultReceive: onJudgeResultReceive,
      onStats: onStats
    })

  const onSelfEditChange = (editor, changes) => {
    setCanRun(editor.doc.getValue()?.length <= 0)
    if (changes[0].origin === undefined) {
      return
    }
    const codemirrorDocLength = (doc) => {
      return doc.indexFromPos({line: doc.lastLine(), ch: 0}) +
        doc.getLine(doc.lastLine()).length
    }

    let docEndLength = codemirrorDocLength(editor.doc)
    let operation = new TextOperation().retain(docEndLength)
    let inverse = new TextOperation().retain(docEndLength)

    let indexFromPos = (pos) => {
      return editor.doc.indexFromPos(pos)
    }

    const last = (arr) => {
      return arr[arr.length - 1]
    }

    const sumLengths = (strArr) => {
      if (strArr.length === 0) return 0
      let sum = 0
      for (let i = 0; i < strArr.length; i++) {
        sum += strArr[i].length
      }
      return sum + strArr.length - 1
    }

    const updateIndexFromPos = (indexFromPos, change) => {
      return function (pos) {
        if (posLe(pos, change.from)) return indexFromPos(pos)
        if (posLe(change.to, pos)) {
          return indexFromPos({
            line: pos.line + change.text.length - 1 - (change.to.line - change.from.line),
            ch: (change.to.line < pos.line) ?
              pos.ch :
              (change.text.length <= 1) ?
                pos.ch - (change.to.ch - change.from.ch) + sumLengths(change.text) :
                pos.ch - change.to.ch + last(change.text).length
          }) + sumLengths(change.removed) - sumLengths(change.text)
        }
        if (change.from.line === pos.line) {
          return indexFromPos(change.from) + pos.ch - change.from.ch
        }
        return indexFromPos(change.from) +
          sumLengths(change.removed.slice(0, pos.line - change.from.line)) +
          1 + pos.ch
      }
    }

    for (let i = changes.length - 1; i >= 0; i--) {
      let change = changes[i]
      indexFromPos = updateIndexFromPos(indexFromPos, change)

      let fromIndex = indexFromPos(change.from)
      let restLength = docEndLength - fromIndex - sumLengths(change.text)

      operation = new TextOperation()
        .retain(fromIndex)
        ['delete'](sumLengths(change.removed))
        .insert(change.text.join('\n'))
        .retain(restLength)
        .compose(operation)

      inverse = inverse.compose(new TextOperation()
        .retain(fromIndex)
        ['delete'](sumLengths(change.text))
        .insert(change.removed.join('\n'))
        .retain(restLength)
      )

      docEndLength += sumLengths(change.removed) - sumLengths(change.text)
    }
    client.applyClient(operation)
  }

  const onConnected = (json) => {
    clearInterval(connectInterval)
    setConnected(true)
    setLanguage(editorLang[json.data.languageId])
    setTypeID(json.data.languageId)
    setShowReconnect(false)
    client = new Client(json.data.version)
    client.setCM(interactBoard?.current?.getCM())
    if (Bee.StringUtils.isNotBlank(json.data.content)) {
      interactBoard?.current?.setValue(json.data.content)
    } else {
      interactBoard?.current?.setValue(placeholder[0])
      setEditValue(placeholder[0])
      client.applyClient(TextOperation.fromJSON([placeholder[0]]))
    }
    onRemind({data: json.data.remind})
    json.data.note && setNoteValue(json.data.note)
  }

  const onDisconnected = (event) => {
    setConnected(false)
    connect()
  }

  const onRemoveDuplicateConnection = () => {
    setToast({
      text: '您已经在其他设备加入会议',
      type: 'error',
      delay: 5000
    })
    history.push("/")
  }

  const connect = (callback) => {
    const connectHandler = () => {
      setShowReconnect(true)
      Model.meeting.statusByCode({
        code: code
      }).then((res) => {
        res.data.attachmentType.map((item) => item.name = item.name.split("/")[1])
        setMeetingStatus(res.data)
        interactClose()
        init({
          url: `wss://${res.data.ip}:${res.data.port}/webrtc?code=${code}&access_token=${Model.session.getInfo()?.jwt?.access_token}`,
          isCreator: Model.session.isMe(res.data.creatorUUID),
          cameraDeviceID: "cameraDeviceID"
        })
        clearInterval(connectInterval)
        const creatAtHandler = () => {
          if (res.data == null) return
          const createAt = new Date(res.data?.createAt).getTime()
          const now = new Date().getTime()
          const diff = now - createAt

          /* 计算剩余小时数 */
          let hours = parseInt(diff / 1000 / (60 * 60), 10)
          /* 计算剩余分钟数 */
          let minutes = parseInt(diff / 1000 / 60 % 60, 10)
          /* 计算剩余秒数 */
          let seconds = parseInt(diff / 1000 % 60, 10)

          /* 如果小于10，则在数字前面添加0 */
          if (hours < 10) {
            hours = '0' + hours
          }
          if (minutes < 10) {
            minutes = '0' + minutes
          }
          if (seconds < 10) {
            seconds = '0' + seconds
          }

          setDuration(hours + "小时 " + minutes + "分 " + seconds + "秒")
        }
        clearInterval(createAtInterval)
        creatAtHandler()
        createAtInterval = setInterval(creatAtHandler, 1000)
        callback && callback(res)
      })
    }
    clearInterval(connectInterval)
    // connectHandler()
    connectInterval = setInterval(connectHandler, 1000)
  }

  const onHeartbeatDelay = (json) => {
    setHeartbeatDelay(json.data)
  }

  const onACK = (json) => {
    client.serverAck(json.data)
  }

  const onJoin = (json) => {
    setUserJoin(json.data)
    userJoinPage = json.data
    setToast({
      text: json.data.name + "加入会议",
      type: "success",
    })
  }

  const onQuit = (json) => {
    interactBoard?.current?.clearOtherCursor()
    setUserJoin(null)
    userJoinPage = null
    setToast({
      text: json.data.name + "退出会议",
      type: "error",
    })
  }

  const onOperation = (json) => {
    if (!(json.data.ops instanceof Array)) return
    client.applyServer(json.data.version, TextOperation.fromJSON(json.data.ops))
  }

  const onRemind = (json) => {
    clearInterval(remindInterval)
    if (json?.data == null || new Date(json?.data).getTime() - new Date().getTime() <= 0) {
      setRemindLoading(false)
      setRemind("设定提醒")
      return
    }
    remindInterval = setInterval(() => {
      if (json?.data == null) return
      const remindAt = new Date(json?.data).getTime()
      const now = new Date().getTime()
      const diff = remindAt - now
      if (diff <= 0) {
        setRemindLoading(false)
        setRemind("设定提醒")
        setToast({text: "计时提醒结束", type: "success"})
        clearInterval(remindInterval)
        return
      }
      /* 计算剩余分钟数 */
      let minutes = parseInt(diff / 1000 / 60, 10)
      /* 计算剩余秒数 */
      let seconds = parseInt(diff / 1000 % 60, 10)

      /* 如果小于10，则在数字前面添加0 */
      if (minutes < 10) {
        minutes = '0' + minutes
      }
      if (seconds < 10) {
        seconds = '0' + seconds
      }

      setRemind(minutes + ":" + seconds + " 后提醒")
    }, 1000)
  }

  const onHidden = (json) => {
    setToast({
      text: "候选人离开页面",
      type: "warning",
      delay: 5000
    })
  }

  const onSelfCursorChange = (editor) => {
    clearTimeout(cursorChangeTimeout)
    cursorChangeTimeout = setTimeout(() => {
      console.log("onSelfCursorChange", interactBoard?.current?.getSelection())
      interactSend(rtcEvent.cursorChange, interactBoard?.current?.getSelection())
    }, 100)
  }

  const onOtherCursorChange = (json) => {
    let user = userJoin || userJoinPage
    if (user == null) return
    const color = getRandomColor(user.uuid.split("-")[4])
    interactBoard?.current?.setOtherCursor(json.data, color, user.name.charAt(0))
  }

  const onSelfLanguageChange = (e, isSend = true) => {
    setLanguage(editorLang[e])
    setTypeID(e)
    isSend && interactSend(rtcEvent.languageChange, parseInt(e))
  }

  const onOtherLanguageChange = (json) => {
    onSelfLanguageChange(json.data, false)
  }

  const onOtherMicChange = (json) => {
    otherCameraRef.current?.setMicOff(json.data)
  }

  const onOtherCameraChange = (json) => {
    otherCameraRef.current?.setCameraOff(json.data)
  }

  const onCameraSwitch = (e) => {
    interactClose()
    init({
      url: `wss://${meetingStatus.ip}:${meetingStatus.port}/webrtc?code=${code}&access_token=${Model.session.getInfo()?.jwt?.access_token}`,
      isCreator: Model.session.isMe(meetingStatus.creatorUUID),
      cameraDeviceID: e
    })
  }

  const onRunClick = () => {
    let code = interactBoard?.current?.getValue()
    const selectedValue = interactBoard?.current?.getSelection()
    if (Bee.StringUtils.isNotBlank(selectedValue)) {
      code = selectedValue
    }
    setIsRun(true)
    Model.judge.commit({
      meetingUUID: meetingStatus.uuid, typeID: typeID, code: code
    }).then((res) => {
    }).catch((err) => {
      setIsRun(false)
      console.log(err)
    })
  }

  const onJudgeResultReceive = (json) => {
    setIsRun(false)
    let result = json.data?.statusCode === 1
    setToast({
      text: result
        ? "运行完毕" + (json.data.result ? ": " + json.data.result : "")
        : "运行失败" + (json.data.result ? ": " + json.data.result : ""),
      type: result ? "success" : "error",
      delay: 5000
    })
  }

  const onStats = ({bitrate, delay}) => {
    setBitrate(bitrate)
    setDelay(delay)
  }

  const onRemindClick = (e) => {
    setRemindLoading(true)
    interactSend(rtcEvent.remind, e)
  }

  const onNoteChange = (editor, data, value) => {
    interactSend(rtcEvent.note, value)
  }

  return loading ? <Page><Spinner style={{position: "absolute", top: "50%", left: "50%"}} /></Page> : (
    <>
      <Header ref={headerRef} width={1500} title="Interaction Fields" subtitle={["会议室", code]} />
      <Page style={{paddingTop: 100}}>
        <Page.Content style={{paddingBottom: 0}}>
          <Grid.Container className="interaction-board" style={{width: "100%", height: "100%"}}
                          alignItems={"center"} justify={"center"} direction={"row"}>
            <Grid.Container className="editor" height="716px">
              <Grid.Container alignItems={"center"} direction={"row"} justify={"space-between"} style={{padding: 24}}>
                <Text h3 style={{fontSize: 32, margin: 0}}>{meetingStatus.title}</Text>
                <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                  <Link style={{fontSize: 14, fontWeight: "bold"}} href={null} block
                        onClick={() => setShowEnv(true)}>环境说明</Link>
                  <Link style={{fontSize: 14, fontWeight: "bold"}} href={null} block
                        onClick={() => {
                          let length = interactBoard?.current?.getValue()?.length
                          let del = 0 - length
                          let insert = placeholder[typeID - 1]
                          interactBoard?.current?.setValue(insert)
                          setEditValue(placeholder[typeID - 1])
                          if (length === 0) {
                            client.applyClient(TextOperation.fromJSON([insert]))
                          } else {
                            client.applyClient(TextOperation.fromJSON([del, insert]))
                          }
                        }}>代码模板</Link>
                  <Spacer w={1} />
                  <Select height="40px"
                          disableMatchWidth
                          onChange={onSelfLanguageChange}
                          value={typeID.toString()}>
                    {meetingStatus.attachmentType?.map((item) => {
                      return <Select.Option key={item.id} value={item.id.toString()}>{item.name}</Select.Option>
                    })}
                  </Select>
                  <Spacer w={1} />
                  <Button auto type="success" iconRight={<PlayFill />} onClick={onRunClick}
                          loading={isRun} disabled={canRun}>运行</Button>
                </div>
              </Grid.Container>

              <Grid>
                <Tabs initialValue="1">
                  <Tabs.Item label={<><Codepen />交互板</>} value="1" height="50px">
                    <div style={{display: "flex", flex: "1", height: "auto", padding: 24}}>
                      <InteractBoard ref={interactBoard} editValue={editValue} language={language}
                                     onChanges={onSelfEditChange}
                                     onChange={null}
                                     onCursorActivity={onSelfCursorChange} />
                    </div>
                  </Tabs.Item>
                  <Tabs.Item label={<><FileText />笔记</>} value="2" height="50px">
                    <div style={{display: "flex", flex: "1", height: "auto", padding: 24}}>
                      <InteractBoard editValue={noteValue} language={"markdown"}
                                     onChange={onNoteChange} onCursorActivity={() => {
                      }} />
                    </div>
                  </Tabs.Item>
                  <Tabs.Item label={<><Clock />运行记录</>} value="3" height="50px">
                    <div style={{display: "flex", flexDirection: "column", flex: "1", height: "auto", padding: 24}}>
                      <CompileRecord meetingUUID={meetingStatus.uuid} />
                    </div>
                  </Tabs.Item>
                </Tabs>
              </Grid>
            </Grid.Container>

            <Spacer w={2} />

            <Grid className="extra" height="716px">
              <Grid.Container justify="space-between" alignItems="center" style={{padding: 24}}>
                <div style={{display: "flex", alignItems: "center"}}>
                  <Clock />
                  <Spacer w={1} />
                  <Description title="已开启时长" content={duration} />
                </div>
                <div style={{display: "flex", alignItems: "center"}}>
                  {remind === "设定提醒"
                    ? showRemindLoading
                      ? <Loading type="success" width={4} />
                      : <Popover content={<div>
                        <Popover.Item onClick={() => onRemindClick(5)}>
                          <Link style={{fontSize: 14, fontWeight: "bold"}} href={null} block>5分钟后</Link>
                        </Popover.Item>
                        <Popover.Item onClick={() => onRemindClick(10)}>
                          <Link style={{fontSize: 14, fontWeight: "bold"}} href={null} block>10分钟后</Link>
                        </Popover.Item>
                        <Popover.Item onClick={() => onRemindClick(15)}>
                          <Link style={{fontSize: 14, fontWeight: "bold"}} href={null} block>15分钟后</Link>
                        </Popover.Item>
                        <Popover.Item onClick={() => onRemindClick(30)}>
                          <Link style={{fontSize: 14, fontWeight: "bold"}} href={null} block>30分钟后</Link>
                        </Popover.Item>
                      </div>}>
                        <Link style={{fontSize: 14, fontWeight: "bold"}} href={null} block>{remind}</Link>
                      </Popover>
                    : <Tooltip text={'点击取消提醒'} enterDelay={500} type="dark">
                      <Link style={{fontSize: 14, fontWeight: "bold"}} href={null} onClick={() => onRemindClick(0)}
                            block>{remind}</Link>
                    </Tooltip>
                  }
                  <Spacer w={1} />
                  <Button auto type="error" ghost iconRight={<Power />} onClick={onRunClick}>结束会议</Button>
                </div>
              </Grid.Container>
              <Divider style={{margin: 0}} />
              <div className="camera">
                {Model.session.isMe(meetingStatus?.creatorUUID) ? (<>
                  <CameraView ref={selfCameraRef}
                              connected={isConnected}
                              isCreator
                              userJoin={userJoin}
                              isSelf onMicChange={() => onSelfMicChange(selfCameraRef.current?.micOff)}
                              onCameraChange={() => onSelfCameraChange(selfCameraRef.current?.cameraOff)}
                              onCameraSwitch={onCameraSwitch} />
                  <Spacer w="24px" />
                  <CameraView ref={otherCameraRef} userJoin={userJoin} />
                </>) : (<>
                  <CameraView ref={otherCameraRef} userJoin={userJoin} isCreator />
                  <Spacer w="24px" />
                  <CameraView ref={selfCameraRef}
                              connected={isConnected}
                              userJoin={userJoin}
                              isSelf onMicChange={() => onSelfMicChange(selfCameraRef.current?.micOff)}
                              onCameraChange={() => onSelfCameraChange(selfCameraRef.current?.cameraOff)}
                              onCameraSwitch={onCameraSwitch} />
                </>)}
              </div>
              <Divider style={{margin: 0}} />
              <Grid.Container justify={"space-between"} style={{padding: 24}}>
                <div style={{display: "flex", alignItems: "center", width: 124}}>
                  <Activity color="#0cce6b" />
                  <Spacer w={1} />
                  <Description title="DELAY-SELF" content={heartbeatDelay >= 0 ? heartbeatDelay + " ms" : "未知"} />
                </div>

                <Tooltip text={'缓存是达到高性能的重要组成部分'} enterDelay={500} placement="bottom" type="dark">
                  <div style={{display: "flex", alignItems: "center", width: 124}}>
                    <Activity color="#F5A623" />
                    <Spacer w={1} />
                    <Description title="DELAY-OTHER" content={"未知"} />
                  </div>
                </Tooltip>

                <Tooltip text={'媒体上行比特率'} enterDelay={500} placement="bottom" type="dark">
                  <div style={{display: "flex", alignItems: "center", width: 124}}>
                    <Wifi />
                    <Spacer w={1} />
                    <Description title="BITRATE-UP" content={bitrate ? bitrate + " KB/s" : "未知"} />
                  </div>
                </Tooltip>

                <Tooltip text={'对等连接出口延迟'} enterDelay={500} placement="bottom" type="dark">
                  <div style={{display: "flex", alignItems: "center", width: 97}}>
                    <Infinity color="#EE0000" />
                    <Spacer w={1} />
                    <Description title="PEER" content={delay ? Math.floor(delay) + " ms" : "未知"} />
                  </div>
                </Tooltip>
              </Grid.Container>
            </Grid>
          </Grid.Container>
        </Page.Content>

        <Modal width="35rem" visible={showEnv} onClose={() => setShowEnv(false)}>
          <Modal.Title>环境说明</Modal.Title>
          <Spacer h={1} />
          <Modal.Subtitle>编译器版本</Modal.Subtitle>
          <Modal.Content>
            <Table data={[
              {language: "Java", compiler: "javac", args: <code>-Dfile.encoding=UTF-8</code>, version: "1.8.0_282"},
              {language: "Python 2", compiler: "python", args: null, version: "2.7.18"},
              {language: "Python 3", compiler: "python3", args: null, version: "3.9.5"},
              {
                language: "C", compiler: "gcc", args: <code>-O2 -w -std=c99 -lm</code>, version: "Alpine 10.3.1" +
                  " 2021042"
              },
              {
                language: "C++", compiler: "g++", args: <code>-O2 -w -std=c++11 -lm</code>, version: "Alpine 10.3.1" +
                  " 2021042"
              },
            ]}>
              <Table.Column prop="language" label="语言" />
              <Table.Column prop="compiler" label="编译器" />
              <Table.Column prop="args" label="编译参数" />
              <Table.Column prop="version" label="版本号" />
            </Table>
          </Modal.Content>
          <Spacer h={1} />
          <Modal.Subtitle>资源限制</Modal.Subtitle>
          <Modal.Content>
            <Table data={[
              {language: "C", memory: "30 MB", cpuTime: "3000 ms", realTime: "5000 ms"},
              {language: "C++", memory: "30 MB", cpuTime: "3000 ms", realTime: "5000 ms"},
              {language: "Java", memory: "30 MB", cpuTime: "3000 ms", realTime: "5000 ms"},
              {language: "Python 2", memory: "30 MB", cpuTime: "3000 ms", realTime: "5000 ms"},
              {language: "Python 3", memory: "30 MB", cpuTime: "3000 ms", realTime: "5000 ms"},
            ]}>
              <Table.Column prop="language" label="语言" />
              <Table.Column prop="memory" label="内存" />
              <Table.Column prop="cpuTime" label="CPU用时" />
              <Table.Column prop="realTime" label="总用时" />
            </Table>
          </Modal.Content>
        </Modal>

        <Modal visible={showReconnect} keyboard={false} disableBackdropClick={true}
               onClose={() => setShowReconnect(false)}>
          <Modal.Content style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <Text h3 b>正在连接服务器</Text>
          </Modal.Content>
          <Modal.Action loading />
        </Modal>

        <style jsx="true">{`
          .interaction-board {
          }

          .editor {
            width: 821px;
            display: flex;
            flex-direction: column;
            background: white;
            box-shadow: rgba(0, 0, 0, 0.12) 0 30px 60px;
            border-radius: 5px;
          }

          .scroll-container {
            width: 100%;
            height: 100%;
            flex: 1;
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            border-bottom: 1px solid #eaeaea;
            padding: 0 24px !important;
          }

          .tabs .content {
            padding: 0 !important;
          }

          .extra {
            display: flex;
            flex-direction: column;
            background: white;
            box-shadow: rgba(0, 0, 0, 0.12) 0 30px 60px;
            border-radius: 5px;
            width: 650px;
          }

          .camera {
            display: flex;
            flex-direction: row;
            padding: 24px;
          }

          .stats-item {
            width: 290px;
            height: 50px;
            margin-left: 12px;
            margin-top: 12px;
            margin-bottom: 12px;
            border: 1px solid #eaeaea;
            display: flex;
            align-items: center;
            padding: 0 16px;
            justify-content: space-between;
            border-radius: 5px;
            color: #999;
            background: #fafafa;
          }
        `}</style>
      </Page>
    </>
  )
}

export default Fields
