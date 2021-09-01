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
import Login from "../component/login/Login"
import { Session } from "../model/Session"
import { Model } from "../model/Model"

const Home = () => {
  const history = useHistory()
  const [code, setCode] = useState()
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
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
      setToast({text: `${err.msg}`, type: "error"})
    }).finally(() => {
      setIsLoginLoading(false)
    })
  }

  const enterMeeting = () => {
    console.log(code)
    if (Bee.StringUtils.isNotBlank(code)) {
      Model.meeting.codeStatus({
        code: Bee.StringUtils.trim(code)
      }).then((res) => {
        history.push(`/fields/${Bee.StringUtils.trim(code)}`)
      }).catch((err) => {
        setToast({text: `${err.msg}`, type: "error"})
      })
    }
  }

  return (
    <Page dotBackdrop width="800px" padding={0}>
      <Page.Header height="80px" width="100%" center>
        <svg height="50" viewBox="0 0 284 65" fill="var(--geist-foreground)">
          <path
            d="M141.68 16.25c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zm117.14-14.5c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zm-39.03 3.5c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9v-46h9zM37.59.25l36.95 64H.64l36.95-64zm92.38 5l-27.71 48-27.71-48h10.39l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10v14.8h-9v-34h9v9.2c0-5.08 5.91-9.2 13.2-9.2z" />
        </svg>
        <Spacer w={50} />
        <Button auto type="abort">联系我们</Button>
        {Model.session.isLogin() ? (
          <Avatar text={`${Model.session.getInfo().user.username.charAt(0)}`} />
        ) : (
          <>
            <Button auto type="abort">注册</Button>
            <Spacer w={1} />
            <Button auto type="secondary" onClick={() => setVisible(true)}>登录</Button>
          </>
        )}
      </Page.Header>
      <Page.Content>
        <Display>
          <Image src="/geist-banner.png" draggable={false} />
        </Display>
        <Grid.Container justify="center" alignItems="center" gap={.5}>
          <Grid justify="center">
            <Input width="300px" scale={2} placeholder="输入邀请码参加面试" clearable
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
  )
}

export default Home
