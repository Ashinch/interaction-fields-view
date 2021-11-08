import { Fieldset, Page, useToasts } from '@geist-ui/react'
import { useHistory, useParams } from "react-router-dom"
import "../util/bee"
import { Header } from "../component/header"
import { UserSettings } from "../component/userSettings"
import { MeetingRecord } from "../component/meetingRecord"
import { useEffect } from "react"
import { Model } from "../model/model"

const Personal = () => {
  const history = useHistory()
  const {page} = useParams()
  const [toasts, setToast] = useToasts()

  useEffect(() => {
    if (!Model.session.isLogin()) {
      setToast({text: "请先登录", type: "error"})
      history.push("/")
    }
  }, [])

  return Model.session.isLogin() && (
    <>
      <Header width={1000} title="Interaction Fields" subtitle={["个人中心", page === "settings" ? "账号设置" : "会议记录"]} />
      <Page width="1000px" style={{paddingTop: 100}}>
        <Page.Content>
          <Fieldset.Group value={page} onChange={param => history.push(`/personal/${param}`)}>
            <UserSettings />
            <MeetingRecord />
          </Fieldset.Group>
        </Page.Content>
      </Page>

      <style jsx="true">{`

      `}</style>
    </>
  )
}

export default Personal
