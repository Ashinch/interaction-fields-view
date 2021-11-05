import {
  Page,
  Text,
  Image,
  Display,
  Button,
  Grid,
  Input,
  Divider,
  Spacer,
  Textarea,
  Modal,
  Code, useModal, AutoComplete
} from '@geist-ui/react'
import { useEffect, useState } from "react"
import "../util/bee.js"

const Login = ({isSMS, setUsername, setPassword}) => {
  const options = [
    {label: '测试账号a', value: 'a'},
    {label: '测试账号b', value: 'b'},
    {label: '测试账号c', value: 'c'},
  ]

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
          <AutoComplete scale={4 / 3} width="100%" placeholder="账号" initialValue="a" options={options} onChange={e => setUsername(e)} />
          <Spacer h={.5} />
          <Input.Password scale={4 / 3} width="100%" placeholder="密码" initialValue="123"
                          onChange={e => setPassword(e.target.value)} />
        </div>
      )}
    </>
  )
}

export default Login
