import {
  Button,
  Display,
  Grid,
  Image,
  Input,
  Page,
  Spacer,
  useModal,
  Modal,
  Code,
  useToasts,
  Avatar
} from '@geist-ui/react'
import { createRef, useRef, useState } from "react"
import { useHistory, useRouteMatch } from "react-router-dom"
import "../util/bee"
import Login from "../component/login"
import { Session } from "../model/session"
import { Model } from "../model/model"

const Home = () => {
  const history = useHistory()
  const [code, setCode] = useState("T3O7BP")
  const [username, setUsername] = useState("a")
  const [password, setPassword] = useState("123")
  const [isSMS, setIsSMS] = useState()
  const [isLoginLoading, setIsLoginLoading] = useState()
  const {visible, setVisible, bindings} = useModal()
  const [toasts, setToast] = useToasts()

  const login = () => {
    setIsLoginLoading(true)
    Model.session.login({
      username: username,
      password: password,
      // mobile: "13633048180",
      // email: "276364092@qq.com"
    }).then((res) => {
      location.reload()
    }).catch((err) => {
      setToast({text: `${err.msg ? err.msg : err}`, type: "error"})
    }).finally(() => {
      setIsLoginLoading(false)
    })
  }

  const enterMeeting = () => {
    console.log(code)
    if (Bee.StringUtils.isNotBlank(code)) {
      Model.meeting.statusByCode({
        code: Bee.StringUtils.trim(code)
      }).then((res) => {
        history.push(`/fields/${Bee.StringUtils.trim(code)}`)
      }).catch((err) => {
        setToast({text: `${err.msg ? err.msg : err}`, type: "error"})
      })
    }
  }

  return (
    <>
      <Page width="1000px" padding={0}>
        <Page.Header height="80px" width="100%" center style={{justifyContent: "space-between"}}>
          <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
            <svg height="26" viewBox="0 0 75 65" fill="var(--geist-foreground)">
              <path d="M37.59.25l36.95 64H.64l36.95-64z" />
            </svg>
            <Spacer w={1} />
            <h3 style={{margin: 0}}>Interaction Fields</h3>
          </div>
          <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
            <Button auto type="abort" onClick={() => setVisible(true)}>GitHub</Button>
            <Button auto type="abort" onClick={() => setVisible(true)}>Contact</Button>
            {Model.session.isLogin() ? (
              <Avatar text={`${Model.session.getInfo().user.username.charAt(0)}`} />
            ) : (
              <>
                <Button auto type="abort">注册</Button>
                <Spacer w={1} />
                <Button auto type="secondary" onClick={() => setVisible(true)}>登录</Button>
              </>
            )}
          </div>
        </Page.Header>
        <Page.Content>
          <div style={{position: "absolute", top: 136, left: 0, right: 0}}>
            <div className="wrapper one">远程音视频通话 <span style={{fontSize: 25}}>1</span></div>
            <div className="wrapper two">协同编辑 <span style={{fontSize: 25}}>2</span></div>
            <div className="wrapper three">在线运行代码 <span style={{fontSize: 25}}>3</span></div>
            <div style={{position: "absolute", top: 0, left: 0, right: 0, zIndex: 10}}>
              <div className="wrapper one">远程音视频通话 <span style={{fontSize: 25}}>1</span></div>
              <div className="wrapper animated-two">协同编辑 <span style={{fontSize: 25}}>2</span></div>
              <div className="wrapper animated-three">在线运行代码 <span style={{fontSize: 25}}>3</span></div>
            </div>
          </div>
          <div style={{height: 560}} />
          <Grid.Container justify="center" alignItems="center" gap={.5}>
            <Grid justify="center">
              <Input width="300px" scale={2} placeholder="输入邀请码参加面试" clearable
                     initialValue="T3O7BP"
                     onChange={e => setCode(e.target.value)} />
            </Grid>
            <Grid justify="center">
              <Button type="secondary-light" height="54px" width="54px"
                      disabled={Bee.StringUtils.isBlank(code)}
                      onClick={enterMeeting}>
                加入
              </Button>
            </Grid>
          </Grid.Container>
          <Grid.Container justify="center" alignItems="center">
            <p style={{width: 600, marginTop: 56, color: "#666", textAlign: "center"}}>
              作为面试官<span style={{color: "#0070f3", cursor: "pointer"}}>发起</span>一场面试会议，或使用邀请码受邀加入会议。
              通过音视频¹进行面试交流、利用协同编辑²和在线编译³来展示您的编码能力。
            </p>
          </Grid.Container>
        </Page.Content>

        <Modal {...bindings}>
          <Modal.Title>登录</Modal.Title>
          <Modal.Subtitle>{isSMS ? "输入短信验证码登录" : "输入账号密码登录"}</Modal.Subtitle>
          <Modal.Content>
            <Login isSMS={isSMS} setUsername={setUsername} setPassword={setPassword} />
          </Modal.Content>
          <Modal.Action passive onClick={() => setIsSMS(!isSMS)}>{isSMS ? "使用账号密码方式" : "使用短信验证方式"}</Modal.Action>
          <Modal.Action onClick={login} loading={isLoginLoading}>登录</Modal.Action>
        </Modal>
      </Page>

      <style jsx="true">{`
        .wrapper {
          line-height: 1.4;
          text-align: center;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
          font-size: 120px;
          font-weight: 900;
          letter-spacing: -.06em;
          user-select: none;
        }

        .one {
          -webkit-background-clip: text;
          -webkit-text-fill-color: #0000;
          background-image: linear-gradient(90deg, #007CF0, #00DFD8);
        }

        .two {
          -webkit-background-clip: text;
          -webkit-text-fill-color: #000f;
        }

        .three {
          -webkit-background-clip: text;
          -webkit-text-fill-color: #000f;
        }

        .animated-two {
          -webkit-background-clip: text;
          -webkit-text-fill-color: #0000;
          background-image: linear-gradient(90deg, #7928CA, #FF0080);
          -webkit-animation: animated-two 6s linear infinite;
        }

        .animated-three {
          -webkit-background-clip: text;
          -webkit-text-fill-color: #0000;
          background-image: linear-gradient(90deg, #FF4D4D, #F9CB28);
          -webkit-animation: animated-three 6s linear infinite;
        }

        @-webkit-keyframes animated-two {
          0%, 50%, 100% {
            opacity: 1;
          }
          66.667%, 83.333% {
            opacity: 0;
          }
        }

        @-webkit-keyframes animated-three {
          0%, 50%, 100% {
            opacity: 0;
          }
          66.667%, 83.333% {
            opacity: 1;
          }
        }

      `}</style>
    </>
  )
}

export default Home
