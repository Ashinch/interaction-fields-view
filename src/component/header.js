import { Divider as DividerIcon } from "@geist-ui/react-icons"
import { Avatar, Button, Divider, Modal, Spacer, useModal, useToasts } from "@geist-ui/react"
import { Model } from "../model/model"
import Login from "./login"
import { useState } from "react"

export const Header = ({width, title, subtitle, shadow}) => {

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

  return (
    <div style={{
      width: "100%", height: 80, display: "flex",
      justifyContent: "center",
      borderBottom: shadow ? "unset" : "1px solid #eaeaea",
      boxShadow: shadow ? "0 0 15px 0 rgb(0 0 0 / 10%)" : "unset"
    }}>
      <div style={{
        width: width, height: "100%", display: "flex",
        flexDirection: "row", justifyContent: "space-between"
      }}>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
          <a href="/">
            <svg height="26" viewBox="0 0 75 65" fill="var(--geist-foreground)">
              <path d="M37.59.25l36.95 64H.64l36.95-64z" />
            </svg>
          </a>
          {subtitle ? subtitle.map(item => {
            return (<>
              <DividerIcon size={36} color="#eaeaea" />
              <h3 style={{margin: 0}}>{item}</h3>
            </>)
          }) : (
            <>
              <Spacer w={1} />
              <h3 style={{margin: 0}}>{title}</h3>
            </>
          )}
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
      </div>

      <Modal {...bindings}>
        <Modal.Title>登录</Modal.Title>
        <Modal.Subtitle>{isSMS ? "输入短信验证码登录" : "输入账号密码登录"}</Modal.Subtitle>
        <Modal.Content>
          <Login isSMS={isSMS} setUsername={setUsername} setPassword={setPassword} />
        </Modal.Content>
        <Modal.Action passive onClick={() => setIsSMS(!isSMS)}>{isSMS ? "使用账号密码方式" : "使用短信验证方式"}</Modal.Action>
        <Modal.Action onClick={login} loading={isLoginLoading}>登录</Modal.Action>
      </Modal>
    </div>
  )
}
