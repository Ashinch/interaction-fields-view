import { Breadcrumbs, Button, Grid, Loading, Page, Select, Spacer, Tabs, Text, useToasts } from '@geist-ui/react'
import { useEffect, useRef, useState } from "react"
import "../util/bee"
import { useHistory, useParams } from "react-router-dom"
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

import {
  interactClose,
  interactInit,
  onOneselfCameraChange,
  onOneselfMicChange,
  rtcEvent,
  send
} from "../model/interact"

let width

const Fields = () => {
  const history = useHistory()
  const {code} = useParams()
  const [loading, setLoading] = useState(true)
  const [editValue, setEditValue] = useState("class a {\n" +
    "    public static void main(String[] args) {\n" +
    "        System.out.println(\"Hello world!\");\n" +
    "    }\n" +
    "}")
  const [meetingStatus, setMeetingStatus] = useState()
  const [language, setLanguage] = useState("text/x-java")
  const [toasts, setToast] = useToasts()

  const otherCameraRef = useRef()
  const oneselfCameraRef = useRef()
  const codeMirrorRef = useRef()
  const codeDivRef = useRef()

  useEffect(() => {
    setLoading(true)
    Model.meeting.codeStatus({
      code: code
    }).then((res) => {
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
      })
      width = document.getElementById("ss")?.clientWidth

    }).catch((err) => {
      setToast({text: `${err.msg}`, type: "error"})
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
    setLanguage(e)
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
    const selectedValue = codeMirrorRef?.current?.editor.getSelection()
    if (Bee.StringUtils.isBlank(selectedValue)) {
      setToast({text: "请选出要运行的代码", type: "error"})
      return
    }
    console.log(selectedValue)
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
              <Text h3>{meetingStatus.title}</Text>
              <div style={{display: "flex", flexDirection: "row"}}>
                <Select width="40px" height="40px" onChange={onOneselfLanguageChange} value={language}>
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
              {Model.session.isMe(meetingStatus?.creatorUUID) ? (<>
                <Camera ref={oneselfCameraRef}
                        isOneself onMicChange={() => onOneselfMicChange(oneselfCameraRef.current?.micOff)}
                        onCameraChange={() => onOneselfCameraChange(oneselfCameraRef.current?.cameraOff)} />
                <Camera ref={otherCameraRef} />
              </>) : (<>
                <Camera ref={otherCameraRef} />
                <Camera ref={oneselfCameraRef}
                        isOneself onMicChange={() => onOneselfMicChange(oneselfCameraRef.current?.micOff)}
                        onCameraChange={() => onOneselfCameraChange(oneselfCameraRef.current?.cameraOff)} />
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
