import {
  Avatar,
  Breadcrumbs,
  Button,
  Divider,
  Grid,
  Page,
  Select,
  Spacer,
  Spinner,
  Tabs,
  Text,
  useToasts
} from '@geist-ui/react'
import { useEffect, useRef, useState } from "react"
import "../util/bee"
import { useHistory, useParams } from "react-router-dom"
import { Model } from "../model/model"
import CameraView from "../component/cameraView"
import { Clock, Codepen, FileText, PlayFill } from '@geist-ui/react-icons'

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

import {
  interactClose,
  interactInit,
  onOneselfCameraChange,
  onOneselfMicChange,
  rtcEvent,
  send
} from "../model/interact"
import CompileRecord from "../component/compileRecord"

let width
const editorLang = [
  "text",
  "text/x-java",
  "text/x-cython",
  "text/x-cython",
  "text/javascript",
  "text/x-csrc",
  "text/x-c++src",
]

const Fields = () => {
  const history = useHistory()
  const {code} = useParams()
  const [loading, setLoading] = useState(true)
  const [editValue, setEditValue] = useState("class Main {\n" +
    "    public static void main(String[] args) {\n" +
    "        System.out.println(\"Hello world!\");\n" +
    "    }\n" +
    "}")
  const [meetingStatus, setMeetingStatus] = useState()
  const [typeID, setTypeID] = useState(1)
  const [language, setLanguage] = useState(editorLang[typeID])
  const [toasts, setToast] = useToasts()

  const otherCameraRef = useRef()
  const oneselfCameraRef = useRef()
  const codeMirrorRef = useRef()
  const codeDivRef = useRef()

  useEffect(() => {
    setLoading(true)
    Model.meeting.statusByCode({
      code: code
    }).then((res) => {
      res.data.attachmentType.map((item) => item.name = item.name.split("/")[1])
      setMeetingStatus(res.data)
      setLoading(false)

      interactInit({
        url: `wss://${res.data.ip}:${res.data.port}/webrtc?code=${code}&access_token=${Model.session.getInfo()?.jwt?.access_token}`,
        isCreator: Model.session.isMe(res.data.creatorUUID),
        onAddOneselfStream: onAddOneselfStream,
        onAddOtherStream: onAddOtherStream,
        onOtherMicChange: onOtherMicChange,
        onOtherCameraChange: onOtherCameraChange,
        onOtherEditChange: onOtherEditChange,
        onOtherLanguageChange: onOtherLanguageChange,
        onJudgeResultReceive: onJudgeResultReceive
      })
      width = document.getElementById("ss")?.clientWidth

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

  const onOneselfEditChange = (editor, data, value) => {
    setEditValue(value)
    send(rtcEvent.editChange, data)
  }

  const onOtherEditChange = (json) => {
    if (json.data.origin === '+input' || json.data.origin === 'paste' || json.data.origin === '+delete' || json.data.origin === 'undo') {
      codeMirrorRef?.current?.editor.doc.replaceRange(json.data.text, json.data.from, json.data.to)
    }
  }

  const onOneselfLanguageChange = (e, isSend = true) => {
    console.log(e)
    setLanguage(editorLang[e])
    setTypeID(e)
    isSend && send(rtcEvent.languageChange, e)
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

  const onRunClick = () => {
    let code = editValue
    const selectedValue = codeMirrorRef?.current?.editor.getSelection()
    if (Bee.StringUtils.isNotBlank(selectedValue)) {
      code = selectedValue
    }
    console.log("onRunClick", selectedValue)
    Model.judge.commit({meetingUUID: meetingStatus.uuid, typeID: typeID, code: code})
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const onJudgeResultReceive = (json) => {
    console.log("onJudgeResultReceive", json)
    let result = json.data?.statusCode === 1
    setToast({
      text: result
        ? "运行完成" + (json.data.result ? ": " + json.data.result : "")
        : "运行失败" + (json.data.result ? ": " + json.data.result : ""),
      type: result ? "success" : "error",
      delay: 5000
    })
  }

  return loading ? <Page><Spinner style={{position: "absolute", top: "50%", left: "50%"}} /></Page> : (
    <Page dotBackdrop>
      <Page.Header>
        <Breadcrumbs>
          <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Item>Fields</Breadcrumbs.Item>
        </Breadcrumbs>
      </Page.Header>
      <Page.Content style={{flex: 1}}>
        <Grid.Container className="interaction-board" style={{width: "100%", height: "100%"}} direction={"row"}>
          <Grid.Container className="editor">
            <Grid.Container alignItems={"center"} direction={"row"} justify={"space-between"}>
              <Text h3 style={{fontSize: 32, margin: 0}}>{meetingStatus.title}</Text>
              <div style={{display: "flex", flexDirection: "row"}}>
                <Select width="40px" height="40px"
                        onChange={onOneselfLanguageChange}
                        initialValue={typeID.toString()}
                        value={typeID.toString()}>
                  {meetingStatus.attachmentType?.map((item) => {
                    return <Select.Option key={item.id} value={item.id.toString()}>{item.name}</Select.Option>
                  })}
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
                  <div id="ss" ref={codeDivRef} style={{display: "flex", flex: "1", height: "auto"}}>
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
                      onBeforeChange={onOneselfEditChange}
                      spellcheck
                      editorDidMount={(editor) => {
                        console.log(width)
                        // editor.setSize(document.getElementById("ss").clientWidth, document.getElementById("ss").clientHeight)
                      }}
                    />
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
              <Text h3 style={{fontSize: 32, marginBottom: 0}}>信息</Text>
              <Avatar.Group count={2}>
                <Avatar text="刘" stacked />
                <Avatar text="Ana" stacked />
              </Avatar.Group>
            </Grid.Container>
            <Spacer h="24px" />

            <Grid.Container gap={2}>
              <Grid style={{flex: 1}}>
                <div style={{
                  height: 50,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: 5,
                  background: "black",
                  color: "white",
                  padding: "0 12px"
                }}>
                  <Text b style={{fontSize: 16}}>面试官</Text>
                  <span style={{fontSize: 12}}>已加入</span>
                </div>
              </Grid>
              <Grid style={{flex: 1}}>
                <div style={{
                  height: 50,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: 5,
                  background: "#fafafa",
                  color: "#cccccc",
                  border: "1px #EAEAEA solid",
                  padding: "0 12px"
                }}>
                  <Text b style={{fontSize: 16}}>候选人</Text>
                  <span style={{fontSize: 12}}>未加入</span>
                </div>
              </Grid>
            </Grid.Container>
            <Spacer h="24px" />
            <div className="camera" style={{borderRadius: 50}}>
              {Model.session.isMe(meetingStatus?.creatorUUID) ? (<>
                <CameraView ref={oneselfCameraRef}
                            isOneself onMicChange={() => onOneselfMicChange(oneselfCameraRef.current?.micOff)}
                            onCameraChange={() => onOneselfCameraChange(oneselfCameraRef.current?.cameraOff)} />
                <Spacer w="24px" />
                <CameraView ref={otherCameraRef} />
              </>) : (<>
                <CameraView ref={otherCameraRef} />
                <Spacer w="24px" />
                <CameraView ref={oneselfCameraRef}
                            isOneself onMicChange={() => onOneselfMicChange(oneselfCameraRef.current?.micOff)}
                            onCameraChange={() => onOneselfCameraChange(oneselfCameraRef.current?.cameraOff)} />
              </>)}
            </div>
            <Divider style={{margin: "24px 0"}} />
          </Grid>
        </Grid.Container>
      </Page.Content>
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
      `}</style>
    </Page>
  )
}

export default Fields
