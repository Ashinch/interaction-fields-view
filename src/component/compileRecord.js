import { useEffect, useState } from "react"
import "../util/bee.js"
import { Modal, Pagination, Spacer, Spinner, Table, Textarea, useToasts } from "@geist-ui/react"
import { Model } from "../model/model"
import ChevronRight from "@geist-ui/react-icons/chevronRight"
import ChevronLeft from "@geist-ui/react-icons/chevronLeft"
import { TextareaModal } from "./modal/textareaModal"

export const CompileRecord = ({meetingUUID}) => {
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [toasts, setToast] = useToasts()
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState()
  const [modalTitle, setModalTitle] = useState()

  useEffect(() => {
    getRecordList(1, 8)

    return () => {
    }
  }, [])

  const getRecordList = (pageNum, pageSize) => {
    setLoading(true)
    Model.judge.record({
      meetingUUID: meetingUUID,
      pageNum: pageNum,
      pageSize: pageSize,
    }).then((res) => {
      res.data.records.map((item) => {
        item.uuidTrim = item.uuid.split("-")[0].toUpperCase()
        item.language = item.type.name.split("/")[1]
        item.cpuTime = item.cpuTime ? item.cpuTime + " ms" : "0 ms"
        item.realTime = item.realTime ? item.realTime + " ms" : "0 ms"
        const memory = item.memory ? item.memory : 0
        item.memory = memory.toString().length < 4 ? memory + " KB" : (memory / 1024).toFixed(1) + " MB"
        item.status && (item.statusFormat =
          <font color={item.status.id === 1 ? "green" : "red"}>{item.status.name}</font>)
        item.commit = <a onClick={() => onBinaryClick(item)}>查看</a>
        item.output = <a onClick={() => onResultClick(item)}>查看</a>
      })
      setRecords(res.data.records)
      setTotal(res.data.total)
    }).catch((err) => {
      setToast({text: `${err.msg ? err.msg : err}`, type: "error"})
    }).finally(
      setLoading(false)
    )
  }

  const onPaginationChange = (e) => {
    getRecordList(e, 8)
  }

  const onBinaryClick = (item) => {
    Model.judge.binary({
      attachmentUUID: item.uuid
    }).then((res) => {
      setModalTitle("提交代码")
      setModalContent(res.data)
      setShowModal(true)
    })
  }

  const onResultClick = (item) => {
    Model.judge.result({
      attachmentUUID: item.uuid
    }).then((res) => {
      setModalTitle("输出信息")
      setModalContent(res.data)
      setShowModal(true)
    })
  }

  return loading ? <Spinner style={{position: "relative", top: 100, left: "50%"}} /> : (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: 520,
    }}>
      <Table data={records}>
        <Table.Column prop="uuidTrim" label="编号" />
        <Table.Column prop="createAt" label="提交时间" />
        <Table.Column prop="language" label="目标语言" />
        <Table.Column prop="cpuTime" label="CPU用时" />
        <Table.Column prop="realTime" label="运行用时" />
        <Table.Column prop="memory" label="内存消耗" />
        <Table.Column prop="statusFormat" label="状态" />
        <Table.Column prop="commit" label="提交代码" />
        <Table.Column prop="output" label="输出信息" />
      </Table>

      <div className="pageControl">
        <Pagination count={total} onChange={onPaginationChange}>
          <Pagination.Next><ChevronRight /></Pagination.Next>
          <Pagination.Previous><ChevronLeft /></Pagination.Previous>
        </Pagination>
      </div>

      <TextareaModal width="700px" visible={showModal} setVisible={setShowModal} title={modalTitle} content={modalContent} />

      <style jsx="true">{`
        .pageControl {
          display: flex;
          flex-direction: row;
          justify-content: center;
        }
      `}</style>
    </div>
  )
}
