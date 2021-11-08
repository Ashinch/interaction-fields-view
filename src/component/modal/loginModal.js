import { AutoComplete, Button, Grid, Input, Modal, Spacer, useToasts } from '@geist-ui/react'
import { useState } from "react"
import { Model } from "../../model/model"

const options = [
  {label: '测试账号a', value: 'a'},
  {label: '测试账号b', value: 'b'},
  {label: '测试账号c', value: 'c'},
]

export const LoginModal = ({visible, setVisible, disableBackdropClick}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSMS, setIsSMS] = useState(false)
  const [username, setUsername] = useState(options[0].value)
  const [password, setPassword] = useState("123")
  const [toasts, setToast] = useToasts()

  const login = () => {
    setIsLoading(true)
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
      setIsLoading(false)
    })
  }

  const getLoginDom = () => {
    return (
      <>
        {isSMS ? (
          <div>
            <Input scale={4 / 3} width="100%" placeholder="手机号" />
            <Spacer h={.5} />
            <Grid direction="row" width="100%">
              <Input scale={4 / 3} width="80%" placeholder="验证码" />
              <Button width="20%" type="secondary">发送</Button>
            </Grid>
          </div>
        ) : (
          <div>
            <AutoComplete scale={4 / 3} width="100%" placeholder="账号" initialValue="a" options={options}
                          onChange={e => setUsername(e)} />
            <Spacer h={.5} />
            <Input.Password scale={4 / 3} width="100%" placeholder="密码" initialValue="123"
                            onChange={e => setPassword(e.target.value)} />
          </div>
        )}
      </>
    )
  }

  return (
    <Modal visible={visible} keyboard={!disableBackdropClick} disableBackdropClick={disableBackdropClick}
           onClose={() => setVisible(false)}>
      <Modal.Title>登录</Modal.Title>
      <Modal.Subtitle>{isSMS ? "输入短信验证码登录" : "输入账号密码登录"}</Modal.Subtitle>
      <Modal.Content>
        {getLoginDom()}
      </Modal.Content>
      <Modal.Action passive onClick={() => setIsSMS(!isSMS)}>{isSMS ? "使用账号密码方式" : "使用短信验证方式"}</Modal.Action>
      <Modal.Action onClick={login} loading={isLoading}>登录</Modal.Action>
    </Modal>
  )
}
