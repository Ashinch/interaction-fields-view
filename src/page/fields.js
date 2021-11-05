import {
  Button, ButtonDropdown,
  Description,
  Divider,
  Grid, Link, Loading, Modal,
  Page, Popover,
  Select,
  Spacer,
  Spinner, Table,
  Tabs,
  Text, Textarea, Tooltip,
  useToasts
} from '@geist-ui/react'
import { Clock, Codepen, FileText, PlayFill, X } from "@geist-ui/react-icons"
import { useEffect, useRef, useState } from "react"
import "../util/bee"
import { useHistory, useParams } from "react-router-dom"
import { Model } from "../model/model"
import CameraView from "../component/cameraView"


import {
  interactClose,
  interactInit,
  onSelfCameraChange,
  onSelfMicChange,
  rtcEvent,
  send
} from "../model/interact"
import CompileRecord from "../component/compileRecord"
import InteractBoard, { editorLang, placeholder } from "../component/interactBoard"
import TextOperation from "../util/text-operation"
import Client from "../util/client"
import { Header } from "../component/header"
import Activity from "@geist-ui/react-icons/activity"
import Wifi from "@geist-ui/react-icons/wifi"
import Infinity from "@geist-ui/react-icons/infinity"
import Power from "@geist-ui/react-icons/power"

let client
let remindInterval

const Fields = () => {
  const history = useHistory()
  const {code} = useParams()
  const [loading, setLoading] = useState(true)
  const [editValue, setEditValue] = useState("")
  const [meetingStatus, setMeetingStatus] = useState()
  const [duration, setDuration] = useState()
  const [isConnected, setConnected] = useState(true)
  const [userJoin, setUserJoin] = useState()
  const [remind, setRemind] = useState("设定提醒")
  const [bitrate, setBitrate] = useState()
  const [delay, setDelay] = useState()
  const [typeID, setTypeID] = useState(1)
  const [language, setLanguage] = useState(editorLang[typeID])
  const [isRun, setIsRun] = useState(false)
  const [canRun, setCanRun] = useState(!editValue)
  const [showEnv, setShowEnv] = useState(false)
  const [showRemindLoading, setRemindLoading] = useState(false)
  const [noteValue, setNoteValue] = useState("# 会议笔记\n\n> 这里输入的文本仅自己可见（支持Markdown语法高亮）\n\n")
  const [toasts, setToast] = useToasts()

  const otherCameraRef = useRef()
  const selfCameraRef = useRef()
  const interactionBoard = useRef()
  const codeDivRef = useRef()

  useEffect(() => {
    setLoading(true)
    Model.meeting.statusByCode({
      code: code
    }).then((res) => {
      res.data.attachmentType.map((item) => item.name = item.name.split("/")[1])
      setMeetingStatus(res.data)
      setLoading(false)

      connect({
        url: `wss://${res.data.ip}:${res.data.port}/webrtc?code=${code}&access_token=${Model.session.getInfo()?.jwt?.access_token}`,
        isCreator: Model.session.isMe(res.data.creatorUUID),
        cameraDeviceID: "cameraDeviceID"
      })

      setInterval(() => {
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
      }, 1000)


      window.addEventListener('visibilitychange', () => {
        if (document.hidden && !Model.session.isMe(res.data.creatorUUID)) {
          send(rtcEvent.hidden, null)
        }
      })

      window.onbeforeunload = (e) => {
        e.returnValue = "确定离开当前页面吗？"
      }

    }).catch((err) => {
      setToast({text: `${err.msg ? err.msg : err}`, type: "error"})
      history.push("/")
    })

    return () => {
      window.removeEventListener('visibilitychange', () => {
      })
      interactClose()
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


  const connect = ({url, isCreator, cameraDeviceID}) =>
    interactInit({
      url: url,
      isCreator: isCreator,
      cameraDeviceID: cameraDeviceID,
      onConnected: onConnected,
      onDisconnected: onDisconnected,
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

  const onSelfEditChange = (editor, data, value) => {
    setCanRun(value.length <= 0)
    // setEditValue(value)
    if (data.origin === undefined) {
      return
    }
    console.log(data, editor.doc.cm.indexFromPos(data.from))

    const codemirrorDocLength = (doc) => {
      return doc.indexFromPos({line: doc.lastLine(), ch: 0}) +
        doc.getLine(doc.lastLine()).length
    }

    let docEndLength = codemirrorDocLength(editor.doc.cm)
    let operation = new TextOperation().retain(docEndLength)
    let inverse = new TextOperation().retain(docEndLength)

    let indexFromPos = function (pos) {
      return editor.doc.cm.indexFromPos(pos)
    }

    function last(arr) {
      return arr[arr.length - 1]
    }

    const sumLengths = (strArr) => {
      if (strArr.length === 0) {
        return 0
      }
      let sum = 0
      for (let i = 0; i < strArr.length; i++) {
        sum += strArr[i].length
      }
      return sum + strArr.length - 1
    }

    const updateIndexFromPos = (indexFromPos, change) => {
      return function (pos) {
        if (posLe(pos, change.from)) {
          return indexFromPos(pos)
        }
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

    indexFromPos = updateIndexFromPos(indexFromPos, data)

    let fromIndex = indexFromPos(data.from)
    let restLength = docEndLength - fromIndex - sumLengths(data.text)

    operation = new TextOperation()
      .retain(fromIndex)
      ['delete'](sumLengths(data.removed))
      .insert(data.text.join('\n'))
      .retain(restLength)
      .compose(operation)

    inverse = inverse.compose(new TextOperation()
      .retain(fromIndex)
      ['delete'](sumLengths(data.text))
      .insert(data.removed.join('\n'))
      .retain(restLength)
    )

    console.log(`operation: ${JSON.stringify(operation)}, inverse: ${JSON.stringify(inverse)}`)
    client.applyClient(operation)
  }

  const onConnected = (json) => {
    // if (!(json.data.ops instanceof Array)) return
    client = new Client(json.data.version)
    client.setCM(interactionBoard?.current?.getEditor().doc.cm)
    if (Bee.StringUtils.isNotBlank(json.data.content)) {
      interactionBoard?.current?.replaceRange(json.data.content, {line: 0, ch: 0})
    } else {
      setEditValue(placeholder[0])
      client.applyClient(new TextOperation().insert(placeholder[0]))
    }
    onRemind({data: json.data.remind})
    json.data.note && setNoteValue(json.data.note)
  }

  const onDisconnected = (event) => {
    setConnected(false)
  }

  const onACK = (json) => {
    client.serverAck(json.data)
  }

  const onJoin = (json) => {
    setUserJoin(json.data)
  }

  const onQuit = (json) => {
    setUserJoin(null)
  }

  const onOperation = (json) => {
    if (!(json.data.ops instanceof Array)) return
    client.applyServer(json.data.version, json.data.ops)
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
    send(rtcEvent.cursorChange, editor.getCursor())
  }

  const onOtherCursorChange = (json) => {
    console.log(json)
    interactionBoard?.current?.markLine(json.data.line)
  }

  const onSelfLanguageChange = (e, isSend = true) => {
    if (language === editorLang[e]) return
    console.log(e)
    setLanguage(editorLang[e])
    setTypeID(e)
    isSend && client.applyClient(new TextOperation().delete(editValue.length).insert(placeholder[e - 1]))
    isSend && send(rtcEvent.languageChange, e)
    setEditValue(placeholder[e - 1])
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
    console.log(e)
    interactClose()
    connect({
      url: `wss://${meetingStatus.ip}:${meetingStatus.port}/webrtc?code=${code}&access_token=${Model.session.getInfo()?.jwt?.access_token}`,
      isCreator: Model.session.isMe(meetingStatus.creatorUUID),
      cameraDeviceID: e
    })
  }

  const onRunClick = () => {
    let code = editValue
    const selectedValue = interactionBoard?.current?.getSelection()
    if (Bee.StringUtils.isNotBlank(selectedValue)) {
      code = selectedValue
    }
    setIsRun(true)
    Model.judge.commit({meetingUUID: meetingStatus.uuid, typeID: typeID, code: code})
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        setIsRun(false)
        console.log(err)
      })
  }

  const onJudgeResultReceive = (json) => {
    setIsRun(false)
    console.log("onJudgeResultReceive", json)
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
    send(rtcEvent.remind, e)
  }

  const onNoteChange = (editor, data, value) => {
    send(rtcEvent.note, value)
  }

  return loading ? <Page><Spinner style={{position: "absolute", top: "50%", left: "50%"}} /></Page> : (
    <>
      <Header width={1500} title="Interaction Fields" subtitle={["会议室", code]} />
      <Page padding={0}>
        <Page.Content>
          <Grid.Container className="interaction-board" style={{width: "100%", height: "100%"}}
                          alignItems={"center"} justify={"center"} direction={"row"}>
            <Grid.Container className="editor" height="720px">
              <Grid.Container alignItems={"center"} direction={"row"} justify={"space-between"}>
                <Text h3 style={{fontSize: 32, margin: 0}}>{meetingStatus.title}</Text>
                <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                  <Link style={{fontSize: 14, fontWeight: "bold"}} href={null} block
                        onClick={() => setShowEnv(true)}>环境说明</Link>
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
              <Spacer h={1} />
              <Grid>
                <Tabs initialValue="1">
                  <Tabs.Item label={<><Codepen />交互板</>} value="1" height="50px">
                    <Spacer h={1} />
                    <div id="ss" ref={codeDivRef} style={{display: "flex", flex: "1", height: "auto"}}>
                      <InteractBoard ref={interactionBoard} editValue={editValue} language={language}
                                     onChange={onSelfEditChange} onCursorActivity={onSelfCursorChange} />
                    </div>
                  </Tabs.Item>
                  <Tabs.Item label={<><FileText />笔记</>} value="2" height="50px">
                    <Spacer h={1} />
                    <InteractBoard ref={interactionBoard} editValue={noteValue} language={"markdown"}
                                   onChange={onNoteChange} onCursorActivity={() => {
                    }} />
                  </Tabs.Item>
                  <Tabs.Item label={<><Clock />运行记录</>} value="3" height="50px">
                    <Spacer h={1} />
                    <CompileRecord meetingUUID={meetingStatus.uuid} />
                  </Tabs.Item>
                </Tabs>
              </Grid>
            </Grid.Container>
            <Spacer w={2} />
            <Grid className="extra" height="720px">
              <Grid.Container justify="space-between" alignItems="center">
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
                          <Link style={{fontSize: 14}} href={null} block>5分钟后</Link>
                        </Popover.Item>
                        <Popover.Item onClick={() => onRemindClick(10)}>
                          <Link style={{fontSize: 14}} href={null} block>10分钟后</Link>
                        </Popover.Item>
                        <Popover.Item onClick={() => onRemindClick(15)}>
                          <Link style={{fontSize: 14}} href={null} block>15分钟后</Link>
                        </Popover.Item>
                        <Popover.Item onClick={() => onRemindClick(30)}>
                          <Link style={{fontSize: 14}} href={null} block>30分钟后</Link>
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
              <Divider style={{margin: "24px 0"}} />
              <div className="camera" style={{borderRadius: 50}}>
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
              <Divider style={{margin: "24px 0"}} />
              <Grid.Container justify={"space-between"}>
                <div style={{display: "flex", alignItems: "center", width: 124}}>
                  <Activity color="#0cce6b" />
                  <Spacer w={1} />
                  <Description title="HEARTBEAT-1" content={"未知"} />
                </div>

                <Tooltip text={'缓存是达到高性能的重要组成部分'} enterDelay={500} placement="bottom" type="dark">
                  <div style={{display: "flex", alignItems: "center", width: 124}}>
                    <Activity color="#F5A623" />
                    <Spacer w={1} />
                    <Description title="HEARTBEAT-2" content={"未知"} />
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
              {language: "C", compiler: "gcc", args: <code>-O2 -w -std=c99 -lm</code>, version: "10.3.1 2021042"},
              {language: "C++", compiler: "g++", args: <code>-O2 -w -std=c++11 -lm</code>, version: "10.3.1 2021042"},
              {language: "Java", compiler: "javac", args: <code>-Dfile.encoding=UTF-8</code>, version: "1.8.0_282"},
              {language: "Python 2", compiler: "python", args: null, version: "2.7.18"},
              {language: "Python 3", compiler: "python3", args: null, version: "3.9.5"},
            ]}>
              <Table.Column prop="language" label="语言" />
              <Table.Column prop="compiler" label="编译器" />
              <Table.Column prop="args" label="参数" />
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

        <style jsx="true">{`
          .interaction-board {
          }

          .editor {
            width: 821px;
            display: flex;
            flex-direction: column;
            background: white;
            padding: 24px;
            box-shadow: rgba(0, 0, 0, 0.12) 0 30px 60px;
            border-radius: 5px;
          }

          .extra {
            display: flex;
            flex-direction: column;
            background: white;
            padding: 24px;
            box-shadow: rgba(0, 0, 0, 0.12) 0 30px 60px;
            border-radius: 5px;
            width: 650px;
          }

          .camera {
            display: flex;
            flex-direction: row;
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
