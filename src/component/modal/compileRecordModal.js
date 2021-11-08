import { Modal } from '@geist-ui/react'
import { CompileRecord } from "../compileRecord"

export const CompileRecordModal = ({width, title, meetingUUID, visible, setVisible}) => {

  return (
    <Modal width={width} visible={visible} onClose={() => setVisible(false)}>
      <Modal.Title>{title}</Modal.Title>
      <Modal.Content>
        <CompileRecord meetingUUID={meetingUUID} />
      </Modal.Content>
    </Modal>
  )
}
