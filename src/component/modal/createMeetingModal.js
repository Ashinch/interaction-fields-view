import { Input, Modal, useClipboard, useToasts } from '@geist-ui/react'
import { useState } from "react"
import { Model } from "../../model/model"
import Terminal from "@geist-ui/react-icons/terminal"
import "../../util/bee"
import { useHistory } from "react-router-dom"

export const CreateMeetingModal = ({visible, setVisible}) => {
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false)
  const [meetingName, setMeetingName] = useState(Model.session.getInfo()?.user.name + "的会议")
  const [toasts, setToast] = useToasts()
  const {copy} = useClipboard()

  const createMeeting = () => {
    if (Bee.StringUtils.isBlank(meetingName)) return
    setIsLoading(true)
    Model.meeting.create({
      title: meetingName
    }).then((res) => {
      let code = res.data.code
      copy(code)
      setToast({text: "会议创建成功，邀请码已复制到剪贴板，即将跳转至会议室", type: "success"})
      setTimeout(() => {
        history.push(`/fields/${code}`)
      }, 1000)
    }).catch((err) => {
      setToast({text: `${err.msg ? err.msg : err}`, type: "error"})
      setIsLoading(false)
    })
  }

  return (
    <Modal visible={visible}
           onClose={() => setVisible(false)}>
      <Modal.Title>创建会议</Modal.Title>
      <Modal.Subtitle>作为面试官发起一场面试会议</Modal.Subtitle>
      <Modal.Content style={{display: "flex", justifyContent: "center"}}>
        <Input scale={4 / 3} icon={<Terminal />} initialValue={meetingName} clearable
               onChange={e => setMeetingName(e.target.value)} />
      </Modal.Content>
      <Modal.Action passive onClick={() => setVisible(false)}>取消</Modal.Action>
      <Modal.Action onClick={createMeeting} loading={isLoading}>创建</Modal.Action>
    </Modal>
  )
}
