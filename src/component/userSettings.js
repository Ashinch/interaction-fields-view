import { Button, Description, Divider, Fieldset, Grid, Link, Spacer, useToasts } from '@geist-ui/react'
import User from "@geist-ui/react-icons/user"
import Shield from "@geist-ui/react-icons/shield"
import { Model } from "../model/model"
import { useState } from "react"
import Mail from "@geist-ui/react-icons/mail"
import { useHistory } from "react-router-dom"
import Terminal from "@geist-ui/react-icons/terminal"
import { SingleInputModal } from "./modal/singleInputModal"
import { ChangePwdModal } from "./modal/changePwdModal"
import "../util/bee.js"
import { ActivitySessionRecord } from "./activitySessionRecord"

const infoDict = {
  name: {
    title: "姓名",
    icon: <Terminal />,
    value: Model.session.getInfo()?.user?.name
  },
  email: {
    title: "电子邮箱",
    icon: <Mail />,
    value: Model.session.getInfo()?.user?.email
  },
}

export const UserSettings = ({}) => {
  const history = useHistory()
  const [toasts, setToast] = useToasts()
  const [showInfoModal, setInfoModal] = useState(false)
  const [showPwdModal, setPwdModal] = useState(false)
  const [infoValue, setInfoValue] = useState()
  const [infoData, setInfoData] = useState()
  const [showInfoModalLoading, setInfoModalLoading] = useState(false)

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
        window.location.reload()
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
            <Grid><Description title="用户名" content={Model.session.getInfo().user?.username} /></Grid>
            <Spacer w={2} />
            <Grid><Description title="手机号" content={Model.session.getInfo().user?.mobile} /></Grid>
            <Spacer w={2} />
            <Grid><Description title="姓名" content={
              <>
                {Model.session.getInfo().user?.name}
                <Spacer w={.5} />
                <Link href={null} icon color onClick={() => changeInfo(infoDict.name)}>更改</Link>
              </>
            } />
            </Grid>
            <Spacer w={2} />
            <Grid><Description title="电子邮箱" content={
              <>
                {Model.session.getInfo().user?.email}
                <Spacer w={.5} />
                <Link href={null} icon color onClick={() => changeInfo(infoDict.email)}>更改</Link>
              </>
            } />
            </Grid>
            <Spacer w={2} />
            <Grid><Description title="注册于" content={Model.session.getInfo().user?.signUpAt} /></Grid>
          </Grid.Container>
        </Fieldset.Content>
        <Divider my={0} />
        <Fieldset.Content style={{display: "flex", alignItems: "center", paddingTop: 40, paddingBottom: 0}}>
          <Shield />
          <Spacer w={.5} />
          <h4>活动会话</h4>
        </Fieldset.Content>
        <Fieldset.Content>
          <ActivitySessionRecord />
          <Spacer h={1} />
          <Button auto type={"error"} ghost onClick={() => setPwdModal(true)}>更改密码</Button>
        </Fieldset.Content>
      </Fieldset>

      <SingleInputModal width="300px" visible={showInfoModal} setVisible={setInfoModal} icon={infoData?.icon}
                        title={"更改" + infoData?.title} initialValue={infoData?.value} setValue={setInfoValue}
                        action={submitInfoEdit} actionText="确认更改" showLoading={showInfoModalLoading} />

      <ChangePwdModal visible={showPwdModal} setVisible={setPwdModal} />
    </>
  )
}
