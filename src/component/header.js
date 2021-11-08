import { Divider as DividerIcon } from "@geist-ui/react-icons"
import { Avatar, Button, Link, Popover, Spacer } from "@geist-ui/react"
import { Model } from "../model/model"
import { forwardRef, useImperativeHandle, useState } from "react"
import { getAvatarStyle } from "../util/hash"
import { LoginModal } from "./modal/loginModal"
import { CreateMeetingModal } from "./modal/createMeetingModal"

export const Header = forwardRef(({width, title, subtitle, shadow}, ref) => {
  const [loginVisible, setLoginVisible] = useState(false)
  const [createVisible, setCreateVisible] = useState(false)
  const [disableBackdropClick, setDisableBackdropClick] = useState(false)

  useImperativeHandle(ref, () => ({
    showLogin: () => {
      setLoginVisible(true)
      setDisableBackdropClick(true)
    },
    showCreate: () => {
      setCreateVisible(true)
    }
  }))

  const logout = () => {
    Model.session.clearInfo()
  }

  const popContent = () => (
    <div>
      <Popover.Item>
        <Link href="#" onClick={() => {
          setCreateVisible(true)
        }}>发起新会议&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Link>
      </Popover.Item>
      <Popover.Item>
        <Link href="/personal/record">会议记录&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Link>
      </Popover.Item>
      <Popover.Item line />
      <Popover.Item>
        <Link href="/personal/settings">账号设置&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Link>
      </Popover.Item>
      <Popover.Item>
        <Link href="/"
              onClick={logout}>退出&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Link>
      </Popover.Item>
    </div>
  )

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      width: "100%", height: 80, display: "flex",
      justifyContent: "center",
      borderBottom: shadow ? "unset" : "1px solid #eaeaea",
      boxShadow: shadow ? "0 0 15px 0 rgb(0 0 0 / 10%)" : "unset",
      zIndex: 100
    }}>
      <div style={{
        width: width, height: "100%", display: "flex",
        flexDirection: "row", justifyContent: "space-between"
      }}>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
          <a href="/">
            <svg height="26" viewBox="0 0 75 65">
              <path d="M37.59.25l36.95 64H.64l36.95-64z" />
            </svg>
          </a>
          {subtitle ? subtitle.map((item, index) => {
            return (
              <div key={index} style={{display: "flex", alignItems: "center", userSelect: "none"}}>
                <DividerIcon size={36} color="#eaeaea" />
                <h4 style={{margin: 0}}>{item}</h4>
              </div>
            )
          }) : (
            <>
              <Spacer w={1} />
              <h4 style={{margin: 0, userSelect: "none"}}>{title}</h4>
            </>
          )}
        </div>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
          <Button auto type="abort"
                  onClick={() => window.open("https://github.com/Ashinch/interaction-fields")}>GitHub</Button>
          <Button auto type="abort" onClick={() => {
          }}>Credit</Button>
          <Button auto type="abort" onClick={() => {
          }}>About</Button>
          {Model.session.isLogin() ? (
            <>
              <Spacer w={1} />
              <Popover content={popContent} style={{cursor: "pointer"}}>
                <Avatar className="avatar" text={`${Model.session.getInfo().user?.name.charAt(0)}`} />
              </Popover>
            </>
          ) : (
            <>
              <Button auto type="abort">注册</Button>
              <Spacer w={1} />
              <Button auto type="secondary" onClick={() => {
                setLoginVisible(true)
                setDisableBackdropClick(false)
              }}>登录</Button>
            </>
          )}
        </div>
      </div>

      <LoginModal visible={loginVisible} setVisible={setLoginVisible} disableBackdropClick={disableBackdropClick} />

      <CreateMeetingModal visible={createVisible} setVisible={setCreateVisible} />

      <style jsx="true">{`
        .avatar {
          ${getAvatarStyle(Model.session.getInfo()?.user?.uuid?.split("-")[4])}
        }
      `}</style>
    </div>
  )
})
