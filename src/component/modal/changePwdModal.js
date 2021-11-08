import { Input, Modal, Spacer, useToasts } from '@geist-ui/react'
import { useState } from "react"
import { Model } from "../../model/model"
import { useHistory } from "react-router-dom"
import Unlock from "@geist-ui/react-icons/unlock"
import Lock from "@geist-ui/react-icons/lock"
import CheckCircle from "@geist-ui/react-icons/checkCircle"
import "../../util/bee"

export const ChangePwdModal = ({visible, setVisible}) => {
  const history = useHistory()
  const [toasts, setToast] = useToasts()
  const [oldPwdValue, setOldPwdValue] = useState()
  const [firPwdValue, setFirPwdValue] = useState()
  const [secPwdValue, setSecPwdValue] = useState()
  const [isLoading, setIsLoading] = useState(false)

  const submitPwdEdit = () => {
    if (Bee.StringUtils.isBlank(oldPwdValue)) {
      setToast({text: "旧密码不能为空", type: "error"})
      return
    }
    if (Bee.StringUtils.isBlank(firPwdValue)) {
      setToast({text: "新密码不能为空", type: "error"})
      return
    }
    if (Bee.StringUtils.isBlank(secPwdValue)) {
      setToast({text: "新密码不能为空", type: "error"})
      return
    }
    if (firPwdValue !== secPwdValue) {
      setToast({text: "新密码两次输入不一致", type: "error"})
      return
    }

    setIsLoading(true)
    Model.session.changePwd({
      oldPwd: oldPwdValue,
      newPwd: secPwdValue,
    }).then(() => {
      history.push("/")
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
        <b>更改密码</b>
        <Spacer h={2.5} />
        <Input.Password scale={4 / 3} icon={<Unlock />} clearable
                        onChange={e => setOldPwdValue(e.target.value)}>请输入旧密码</Input.Password>
        <Spacer h={3} />
        <Input.Password scale={4 / 3} icon={<Lock />} clearable
                        onChange={e => setFirPwdValue(e.target.value)}>请输入新密码</Input.Password>
        <Spacer h={3} />
        <Input.Password scale={4 / 3} icon={<Lock />} clearable
                        onChange={e => setSecPwdValue(e.target.value)}>再次输入新密码</Input.Password>
        <Spacer h={2.5} />
      </Modal.Content>
      <Modal.Action
        onClick={submitPwdEdit}
        style={{color: "#0070f3"}}
        loading={isLoading}>
        <CheckCircle size={16} />
        <Spacer w={.5} />
        确认更改
      </Modal.Action>
    </Modal>
  )
}
