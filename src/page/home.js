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
import { Header } from "../component/header"

const Home = () => {
  const history = useHistory()
  const [code, setCode] = useState("T3O7BP")
  const [toasts, setToast] = useToasts()

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
      <Header width={1000} title="Interaction Fields"/>
      <Page width="1000px" padding={0}>
        <Page.Content>
          <div style={{position: "absolute", top: 56, left: 0, right: 0}}>
            <div className="wrapper one">实时音视频通话 <span style={{fontSize: 25}}>1</span></div>
            <div className="wrapper two">协同编辑 <span style={{fontSize: 25}}>2</span></div>
            <div className="wrapper three">在线编程面试 <span style={{fontSize: 25}}>3</span></div>
            <div style={{position: "absolute", top: 0, left: 0, right: 0, zIndex: 10}}>
              <div className="wrapper one">实时音视频通话 <span style={{fontSize: 25}}>1</span></div>
              <div className="wrapper animated-two">协同编辑 <span style={{fontSize: 25}}>2</span></div>
              <div className="wrapper animated-three">在线编程面试 <span style={{fontSize: 25}}>3</span></div>
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
            <p style={{width: 800, marginTop: 56, color: "#666", textAlign: "center"}}>
              作为面试官<span style={{color: "#0070f3", cursor: "pointer"}}>发起</span>一场面试会议，或作为候选人受邀加入。
              <br/>通过音视频¹进行实时通话交流，利用协同编辑²来展示您的编程能力，并通过在线编译³得到运行结果。
            </p>
          </Grid.Container>
        </Page.Content>
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
