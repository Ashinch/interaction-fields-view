import { Button, Description, Divider, Fieldset, Grid, Input, Link, Modal, Spacer, useToasts } from '@geist-ui/react'
import "../util/bee.js"
import User from "@geist-ui/react-icons/user"
import Shield from "@geist-ui/react-icons/shield"
import { Model } from "../model/model"
import { useState } from "react"
import CreditCard from "@geist-ui/react-icons/creditCard"
import Mail from "@geist-ui/react-icons/mail"
import CheckCircle from "@geist-ui/react-icons/checkCircle"
import Unlock from "@geist-ui/react-icons/unlock"
import Lock from "@geist-ui/react-icons/lock"
import { useHistory } from "react-router-dom"

const UserSettings = ({}) => {
  const history = useHistory()
  const [toasts, setToast] = useToasts()
  const [showInfoModal, setInfoModal] = useState(false)
  const [showPwdModal, setPwdModal] = useState(false)
  const [infoValue, setInfoValue] = useState()
  const [oldPwdValue, setOldPwdValue] = useState()
  const [firPwdValue, setFirPwdValue] = useState()
  const [secPwdValue, setSecPwdValue] = useState()
  const [infoData, setInfoData] = useState()
  const [showInfoModalLoading, setInfoModalLoading] = useState(false)
  const [showPwdModalLoading, setPwdModalLoading] = useState(false)
  const infoDict = {
    name: {
      title: "姓名",
      icon: <CreditCard />,
      value: Model.session.getInfo()?.user?.name
    },
    email: {
      title: "电子邮箱",
      icon: <Mail />,
      value: Model.session.getInfo()?.user?.email
    },
  }

  const changeInfo = (info) => {
    setInfoData(info)
    setInfoModal(true)
  }

  const submitInfoEdit = ({close}) => {
    if (Bee.StringUtils.isBlank(infoValue)) return
    let requestParam = {
      name: null,
      email: null,
    }

    if (infoData.title === infoDict.name.title) {
      requestParam.name = infoValue
    } else if (infoData.title === infoDict.email.title) {
      requestParam.email = infoValue
    } else {
      return
    }

    setInfoModalLoading(true)
    Model.session.edit(requestParam)
      .then(() => {
        close()
      })
      .catch((err) => {
        setToast({text: `${err.msg ? err.msg : err}`, type: "error"})
      })
      .finally(() => {
        setInfoModalLoading(false)
      })
  }

  const submitPwdEdit = ({close}) => {
    console.log(oldPwdValue, firPwdValue, secPwdValue)
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

    setPwdModalLoading(true)
    Model.session.changePwd({
      oldPwd: oldPwdValue,
      newPwd: secPwdValue,
    }).then(() => {
      history.push("/")
    }).catch((err) => {
      setToast({text: `${err.msg ? err.msg : err}`, type: "error"})
    }).finally(() => {
      setPwdModalLoading(false)
    })
  }

  return (
    <>
      <Fieldset label="账号设置" value="settings">
        <Fieldset.Content style={{display: "flex", alignItems: "center", paddingTop: 40, paddingBottom: 0}}>
          <User />
          <Spacer w={.5} />
          <h4>个人信息</h4>
        </Fieldset.Content>
        <Fieldset.Content>
          <Grid.Container gap={4}>
            <Grid>
              <Description title="用户名"
                           content={Model.session.getInfo().user?.username} />
            </Grid>
            <Spacer w={2} />
            <Grid>
              <Description title="手机号"
                           content={Model.session.getInfo().user?.mobile} />
            </Grid>
            <Spacer w={2} />
            <Grid>
              <Description title="姓名"
                           content={<>{Model.session.getInfo().user?.name}<Spacer w={.5} /><Link href={null} icon color
                                                                                                 onClick={() => changeInfo(infoDict.name)}>更改</Link></>} />
            </Grid>
            <Spacer w={2} />
            <Grid>
              <Description title="电子邮箱"
                           content={<>{Model.session.getInfo().user?.email}<Spacer w={.5} /><Link href={null} icon color
                                                                                                  onClick={() => changeInfo(infoDict.email)}>更改</Link></>} />
            </Grid>
            <Spacer w={2} />
            <Grid>
              <Description title="注册于" content={Model.session.getInfo().user?.signUpAt} />
            </Grid>
          </Grid.Container>
        </Fieldset.Content>
        <Divider my={0} />
        <Fieldset.Content style={{display: "flex", alignItems: "center", paddingTop: 40, paddingBottom: 0}}>
          <Shield />
          <Spacer w={.5} />
          <h4>安全</h4>
        </Fieldset.Content>
        <Fieldset.Content>
          <Button auto type={"error"} ghost onClick={() => setPwdModal(true)}>更改密码</Button>
        </Fieldset.Content>
      </Fieldset>

      <Modal width="300px" visible={showInfoModal} onClose={() => setInfoModal(false)}>
        <Modal.Content
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 0,
            paddingBottom: 0
          }}>
          <b>更改{infoData?.title}</b>
          <Spacer h={1} />
          <Input initialValue={infoData?.value} icon={infoData?.icon}
                 onChange={e => setInfoValue(e.target.value)} />
        </Modal.Content>
        <Modal.Action
          onClick={submitInfoEdit}
          style={{color: "#0070f3"}}
          loading={showInfoModalLoading}>
          <CheckCircle size={16} />
          <Spacer w={.5} />
          确认更改
        </Modal.Action>
      </Modal>

      <Modal width="300px" visible={showPwdModal} onClose={() => setPwdModal(false)}>
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
          <Input.Password icon={<Unlock />} clearable
                          onChange={e => setOldPwdValue(e.target.value)}>请输入旧密码</Input.Password>
          <Spacer h={3} />
          <Input.Password icon={<Lock />} clearable
                          onChange={e => setFirPwdValue(e.target.value)}>请输入新密码</Input.Password>
          <Spacer h={3} />
          <Input.Password icon={<Lock />} clearable
                          onChange={e => setSecPwdValue(e.target.value)}>再次输入新密码</Input.Password>
          <Spacer h={2.5} />
        </Modal.Content>
        <Modal.Action
          onClick={submitPwdEdit}
          style={{color: "#0070f3"}}
          loading={showPwdModalLoading}>
          <CheckCircle size={16} />
          <Spacer w={.5} />
          确认更改
        </Modal.Action>
      </Modal>
    </>
  )
}

export default UserSettings
