import { useEffect, useState } from "react"
import "../util/bee.js"
import { Code, Modal, Pagination, Spacer, Spinner, Table, Textarea, useToasts } from "@geist-ui/react"
import { Model } from "../model/model"
import ChevronRight from "@geist-ui/react-icons/chevronRight"
import ChevronLeft from "@geist-ui/react-icons/chevronLeft"
import { TextareaModal } from "./modal/textareaModal"

export const ActivitySessionRecord = () => {
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [toasts, setToast] = useToasts()
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState()
  const [modalTitle, setModalTitle] = useState()

  useEffect(() => {
    getRecordList()

    return () => {
    }
  }, [])

  const getRecordList = () => {
    setLoading(true)
    Model.session.session().then((res) => {
      let list = []
      for (let i = 0; i < res.data.length; i++) {
        list.push({
          index: i + 1,
          value: <Code my={0}>{res.data[i].substring(0, 80)}...</Code>,
          op: Model.session.getInfo()?.jwt?.access_token.split(".")[2] === res.data[i]
            ? "当前会话" : <a onClick={() => onOfflineClick(res.data[i])}>下线</a>,
        })
      }
      setRecords(list)
    }).catch((err) => {
      setToast({text: `${err.msg ? err.msg : err}`, type: "error"})
    }).finally(
      setLoading(false)
    )
  }

  const onOfflineClick = (value) => {
    // let temp = Model.session.getInfo()
    // Reflect.set(temp.jwt, "expireAt", (new Date().getTime() + 1000))
    // Model.session.setInfo(temp)
    Model.session.offline({
      signature: value
    }).finally(() => {
      getRecordList()
    })
  }

  return loading ? <Spinner style={{position: "relative", top: 100, left: "50%"}} /> : (
    <div>
      <Table data={records}>
        <Table.Column prop="index" label="序号" width={100} />
        <Table.Column prop="value" label="凭证签名" />
        <Table.Column prop="op" label="操作" width={100} />
      </Table>

      <TextareaModal width="700px" visible={showModal} setVisible={setShowModal} title={modalTitle}
                     content={modalContent} />
    </div>
  )
}
