import { Input, Modal, Spacer, useToasts } from '@geist-ui/react'
import { useState } from "react"
import { Model } from "../../model/model"
import "../../util/bee"
import { AtSign, CheckCircle, Hash, Lock, Phone, UserPlus } from "@geist-ui/react-icons"

export const SignUpModal = ({visible, setVisible}) => {
  const [toasts, setToast] = useToasts()
  const [usernameValue, setUsernameValue] = useState()
  const [nameValue, setNameValue] = useState()
  const [mobileValue, setMobileValue] = useState()
  const [emailValue, setEmailValue] = useState()
  const [firPwdValue, setFirPwdValue] = useState()
  const [secPwdValue, setSecPwdValue] = useState()
  const [isLoading, setIsLoading] = useState(false)

  const submit = () => {
    if (Bee.StringUtils.isBlank(usernameValue)) {
      setToast({text: "登录账号不能为空", type: "error"})
      return
    }
    if (Bee.StringUtils.isBlank(nameValue)) {
      setToast({text: "姓名不能为空", type: "error"})
      return
    }
    if (Bee.StringUtils.isBlank(mobileValue)) {
      setToast({text: "手机号不能为空", type: "error"})
      return
    }
    if (Bee.StringUtils.isBlank(emailValue)) {
      setToast({text: "电子邮箱不能为空", type: "error"})
      return
    }
    if (Bee.StringUtils.isBlank(firPwdValue) || Bee.StringUtils.isBlank(secPwdValue)) {
      setToast({text: "密码不能为空", type: "error"})
      return
    }
    if (firPwdValue !== secPwdValue) {
      setToast({text: "登录密码两次输入不一致", type: "error"})
      return
    }

    setIsLoading(true)
    Model.session.signUp({
      username: usernameValue,
      name: nameValue,
      password: secPwdValue,
      mobile: mobileValue,
      email: emailValue,
    }).then(() => {
      location.reload()
    }).catch((err) => {
      setToast({text: `${err.msg ? err.msg : err}`, type: "error"})
    }).finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <Modal width="300px" visible={visible} onClose={() => setVisible(false)}>
      <Modal.Content
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 0,
          paddingBottom: 0
        }}>
        <b>账号注册</b>
        <Spacer h={2.5} />
        <Input scale={4 / 3} icon={<Hash />} clearable
               onChange={e => setUsernameValue(e.target.value)} placeholder="登录时使用，唯一">登录账号</Input>
        <Spacer h={2.5} />
        <Input scale={4 / 3} icon={<UserPlus />} clearable
               onChange={e => setNameValue(e.target.value)} placeholder="长度2~6个字符">姓名</Input>
        <Spacer h={3} />
        <Input scale={4 / 3} icon={<Phone />} clearable
               onChange={e => setMobileValue(e.target.value)} placeholder="手机号">联系电话</Input>
        <Spacer h={3} />
        <Input scale={4 / 3} icon={<AtSign />} clearable
               onChange={e => setEmailValue(e.target.value)} placeholder="邮箱">电子邮箱</Input>
        <Spacer h={3} />
        <Input.Password scale={4 / 3} icon={<Lock />} clearable
                        onChange={e => setFirPwdValue(e.target.value)} placeholder="两次输入须一致">登录密码</Input.Password>
        <Spacer h={3} />
        <Input.Password scale={4 / 3} icon={<Lock />} clearable
                        onChange={e => setSecPwdValue(e.target.value)} placeholder="两次输入须一致">再次输入密码</Input.Password>
        <Spacer h={2.5} />
      </Modal.Content>
      <Modal.Action
        onClick={submit}
        style={{color: "#0070f3"}}
        loading={isLoading}>
        <CheckCircle size={16} />
        <Spacer w={.5} />
        确认更改
      </Modal.Action>
    </Modal>
  )
}
