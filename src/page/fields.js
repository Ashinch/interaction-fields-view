import {
  Avatar,
  Breadcrumbs,
  Button, Card, Checkbox, Code, Description,
  Divider,
  Grid, Note,
  Page,
  Select,
  Spacer,
  Spinner,
  Tabs, Tag,
  Text,
  useToasts
} from '@geist-ui/react'
import { Divider as DividerIcon } from "@geist-ui/react-icons"
import { useEffect, useRef, useState } from "react"
import "../util/bee"
import { useHistory, useParams } from "react-router-dom"
import { Model } from "../model/model"
import CameraView from "../component/cameraView"
import { Clock, Codepen, FileText, PlayFill } from '@geist-ui/react-icons'


import {
  interactClose,
  interactInit,
  onOneselfCameraChange,
  onOneselfMicChange,
  rtcEvent,
  send
} from "../model/interact"
import CompileRecord from "../component/compileRecord"
import InteractionBoard, { editorLang, placeholder } from "../component/interactionBoard"
import TextOperation from "../util/text-operation"
import Client from "../util/client"
import { Header } from "../component/header"
import BarChart from "@geist-ui/react-icons/barChart"
import Activity from "@geist-ui/react-icons/activity"
import Cast from "@geist-ui/react-icons/cast"
import LogOut from "@geist-ui/react-icons/logOut"
import Wifi from "@geist-ui/react-icons/wifi"
import Infinity from "@geist-ui/react-icons/infinity"
import Power from "@geist-ui/react-icons/power"

let client

const Fields = () => {
  const history = useHistory()
  const {code} = useParams()
  const [loading, setLoading] = useState(true)
  const [editValue, setEditValue] = useState("")
  const [meetingStatus, setMeetingStatus] = useState()
  const [duration, setDuration] = useState()
  const [userJoin, setUserJoin] = useState()
  const [bitrate, setBitrate] = useState()
  const [delay, setDelay] = useState()
  const [typeID, setTypeID] = useState(1)
  const [language, setLanguage] = useState(editorLang[typeID])
  const [isRun, setIsRun] = useState(false)
  const [canRun, setCanRun] = useState(!editValue)
  const [toasts, setToast] = useToasts()

  const otherCameraRef = useRef()
  const oneselfCameraRef = useRef()
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
    }).catch((err) => {
      setToast({text: `${err.msg ? err.msg : err}`, type: "error"})
      history.push("/")
    })

    return () => {
      interactClose()
    }
  }, [])

  const onAddOneselfStream = (stream) => {
    oneselfCameraRef.current?.setStream(stream)
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
      onAddOneselfStream: onAddOneselfStream,
      onAddOtherStream: onAddOtherStream,
      onOtherMicChange: onOtherMicChange,
      onOtherCameraChange: onOtherCameraChange,
      onOperation: onOperation,
      onACK: onACK,
      onJoin: onJoin,
      onQuit: onQuit,
      onOtherCursorChange: onOtherCursorChange,
      onOtherLanguageChange: onOtherLanguageChange,
      onJudgeResultReceive: onJudgeResultReceive,
      onStats: onStats
    })

  const onOneselfEditChange = (editor, data, value) => {
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
    console.log("onConnected", json.data.version, json.data.content)
    client = new Client(json.data.version)
    client.setCM(interactionBoard?.current?.getEditor().doc.cm)
    if (Bee.StringUtils.isNotBlank(json.data.content)) {
      interactionBoard?.current?.replaceRange(json.data.content, {line: 0, ch: 0})
    } else {
      setEditValue(placeholder[0])
      client.applyClient(new TextOperation().insert(placeholder[0]))
    }
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
    console.log("onOperation", json.data.version)
    client.applyServer(json.data.version, json.data.ops)
  }

  const onOneselfCursorChange = (editor) => {
    send(rtcEvent.cursorChange, editor.getCursor())
  }

  const onOtherCursorChange = (json) => {
    console.log(json)
    interactionBoard?.current?.markLine(json.data.line)
  }

  const onOneselfLanguageChange = (e, isSend = true) => {
    console.log(e)
    setLanguage(editorLang[e])
    setTypeID(e)
    isSend && client.applyClient(new TextOperation().delete(editValue.length).insert(placeholder[e - 1]))
    isSend && send(rtcEvent.languageChange, e)
    setEditValue(placeholder[e - 1])
  }

  const onOtherLanguageChange = (json) => {
    onOneselfLanguageChange(json.data, false)
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

  return loading ? <Page><Spinner style={{position: "absolute", top: "50%", left: "50%"}} /></Page> : (
    <>
      <Header width={1500} title="Interaction Fields" subtitle={["会议室", code]} shadow />
      <Page padding={0}>
        <Page.Content style={{flex: 1}}>
          <Grid.Container className="interaction-board" style={{width: "100%", height: "100%"}} justify={"center"}
                          direction={"row"}>
            <Grid.Container className="editor">
              <Grid.Container alignItems={"center"} direction={"row"} justify={"space-between"}>
                <Text h3 style={{fontSize: 32, margin: 0}}>{meetingStatus.title}</Text>
                <div style={{display: "flex", flexDirection: "row"}}>
                  <Button auto>环境说明</Button>
                  <Spacer w={1} />
                  <Select width="40px" height="40px"
                          onChange={onOneselfLanguageChange}
                          initialValue={typeID.toString()}
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
                      <InteractionBoard ref={interactionBoard} editValue={editValue} language={language}
                                        onBeforeChange={onOneselfEditChange} onCursorActivity={onOneselfCursorChange} />
                    </div>
                  </Tabs.Item>
                  <Tabs.Item label={<><FileText />笔记</>} value="2" height="50px">
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
                  <Tabs.Item label={<><Clock />运行记录</>} value="3" height="50px">
                    <Spacer h={1} />
                    <CompileRecord meetingUUID={meetingStatus.uuid} />
                  </Tabs.Item>
                </Tabs>
              </Grid>
            </Grid.Container>
            <Spacer w={2} />
            <Grid className="extra">
              <Grid.Container justify="space-between" alignItems="center">
                <div style={{display: "flex", alignItems: "center"}}>
                  <Clock />
                  <Spacer w={1} />
                  <Description title="会议进行时长：27分钟后提醒" content={duration} />
                </div>
                <div style={{display: "flex"}}>
                  <Button auto type="error" ghost iconRight={<Power />} onClick={onRunClick}>结束会议</Button>
                </div>
              </Grid.Container>
              <Divider style={{margin: "24px 0"}} />
              <div className="camera" style={{borderRadius: 50}}>
                {Model.session.isMe(meetingStatus?.creatorUUID) ? (<>
                  <CameraView ref={oneselfCameraRef}
                              isCreator={true}
                              userJoin={userJoin}
                              isOneself onMicChange={() => onOneselfMicChange(oneselfCameraRef.current?.micOff)}
                              onCameraChange={() => onOneselfCameraChange(oneselfCameraRef.current?.cameraOff)}
                              onCameraSwitch={onCameraSwitch} />
                  <Spacer w="24px" />
                  <CameraView ref={otherCameraRef} userJoin={userJoin} />
                </>) : (<>
                  <CameraView ref={otherCameraRef} userJoin={userJoin} isCreator={true} />
                  <Spacer w="24px" />
                  <CameraView ref={oneselfCameraRef}
                              userJoin={userJoin}
                              isOneself onMicChange={() => onOneselfMicChange(oneselfCameraRef.current?.micOff)}
                              onCameraChange={() => onOneselfCameraChange(oneselfCameraRef.current?.cameraOff)}
                              onCameraSwitch={onCameraSwitch} />
                </>)}
              </div>
              <Divider style={{margin: "24px 0"}} />
              <Grid.Container gap={2}>
                <div className="stats-item">
                  <span style={{fontWeight: "bold"}}>HEARTBEAT-1</span>
                  <span style={{display: "flex"}}>
                    <span>0 ms</span>
                    <Spacer w={.5} />
                    <Activity />
                  </span>
                </div>
                <Spacer w={"12px"} />
                <div className="stats-item">
                  <span style={{fontWeight: "bold"}}>HEARTBEAT-2</span>
                  <span style={{display: "flex"}}>
                    <span>0 ms</span>
                    <Spacer w={.5} />
                    <Activity />
                  </span>
                </div>
                <div className="stats-item">
                  <span style={{fontWeight: "bold"}}>BITRATE</span>
                  <span style={{display: "flex"}}>
                    <span>{bitrate} KB/s</span>
                    <Spacer w={.5} />
                    <Wifi />
                  </span>
                </div>
                <Spacer w={"12px"} />
                <div className="stats-item">
                  <span style={{fontWeight: "bold"}}>PEER</span><Spacer w={.5} />
                  <span style={{display: "flex"}}>
                    <span>{Math.floor(delay)} ms</span>
                    <Spacer w={.5} />
                    <Infinity />
                  </span>
                </div>
              </Grid.Container>
            </Grid>
          </Grid.Container>
        </Page.Content>
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
