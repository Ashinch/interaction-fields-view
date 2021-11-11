import { Modal } from '@geist-ui/react'

export const ToastModal = ({
                             width,
                             visible,
                             setVisible,
                             title,
                             subtitle,
                             content,
                             passiveText,
                             actionText,
                             showLoading,
                             passiveHandler,
                             actionHandler,
                           }) => {

  return (
    <Modal width={width} visible={visible} onClose={() => setVisible(false)}>
      <Modal.Title>{title}</Modal.Title>
      <Modal.Subtitle>{subtitle}</Modal.Subtitle>
      <Modal.Content>
        {content}
      </Modal.Content>
      <Modal.Action passive onClick={passiveHandler}>{passiveText}</Modal.Action>
      <Modal.Action loading={showLoading} onClick={actionHandler}>{actionText}</Modal.Action>
    </Modal>
  )
}
