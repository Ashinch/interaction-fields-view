import { Input, Modal, Spacer } from '@geist-ui/react'
import CheckCircle from "@geist-ui/react-icons/checkCircle"

export const SingleInputModal = ({
                                   width,
                                   visible,
                                   setVisible,
                                   title,
                                   initialValue,
                                   setValue,
                                   icon,
                                   actionText,
                                   showLoading,
                                   action,
                                 }) => {

  return (
    <Modal width={width} visible={visible} onClose={() => setVisible(false)}>
      <Modal.Content style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 0,
        paddingBottom: 0
      }}>
        <b>{title}</b>
        <Spacer h={1} />
        <Input scale={4 / 3} initialValue={initialValue} icon={icon}
               onChange={e => setValue(e.target.value)} />
      </Modal.Content>
      <Modal.Action
        onClick={action}
        style={{color: "#0070f3"}}
        loading={showLoading}>
        <CheckCircle size={16} />
        <Spacer w={.5} />
        {actionText}
      </Modal.Action>
    </Modal>
  )
}
