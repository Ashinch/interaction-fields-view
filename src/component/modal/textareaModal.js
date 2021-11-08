import { Modal, Textarea } from '@geist-ui/react'

export const TextareaModal = ({width, title, content, visible, setVisible}) => {

  return (
    <Modal width={width} visible={visible} onClose={() => setVisible(false)}>
      <Modal.Title>{title}</Modal.Title>
      <Modal.Content>
        <Textarea initialValue={content} readOnly width="100%" height="400px" />
      </Modal.Content>
    </Modal>
  )
}
