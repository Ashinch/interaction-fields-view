import {
  Fieldset,
  Input,
  Loading,
  Modal,
  Pagination,
  Select,
  Spacer,
  Table,
  Text,
  Textarea,
  useToasts
} from '@geist-ui/react'
import "../util/bee.js"
import Search from "@geist-ui/react-icons/search"
import ChevronRight from "@geist-ui/react-icons/chevronRight"
import ChevronLeft from "@geist-ui/react-icons/chevronLeft"
import { useEffect, useState } from "react"
import { Model } from "../model/model"
import CompileRecord from "./compileRecord"

const pageSize = 8
let timeout

const MeetingRecord = ({}) => {
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [onlyCreator, setOnlyCreator] = useState(false)
  const [word, setWord] = useState("")
  const [showTextModal, setTextModal] = useState(false)
  const [showCompileModal, setCompileModal] = useState(false)
  const [textModalTitle, setTextModalTitle] = useState("")
  const [textModalContent, setTextModalContent] = useState("")
  const [compileModalUUID, setCompileModalUUID] = useState("")
  const [toasts, setToast] = useToasts()
  useEffect(() => {
    getRecordList(onlyCreator, "", page, pageSize)
  }, [])

  const getRecordList = (onlyCreator, word, pageNum, pageSize) => {
    setLoading(true)
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      Model.meeting.record({
        onlyCreator: onlyCreator,
        word: word,
        pageNum: pageNum,
        pageSize: pageSize
      }).then(res => {
        res.data.records.map((item) => {
          item.docHtml = <a onClick={() => showItem("交互板内容", item.doc)}>查看</a>
          item.noteHtml = <a onClick={() => showItem("笔记内容", item.note)}>查看</a>
          item.compileRecordHtml = <a onClick={() => {
            setCompileModalUUID(item.uuid)
            setCompileModal(true)
          }}>查看</a>
        })
        setRecords(res.data.records)
        setTotal(res.data.total)
      }).catch((err) => {
        console.log(err)
        setToast({text: `${err.msg ? err.msg : err}`, type: "error"})
      }).finally(
        setLoading(false)
      )
    }, 500)
  }

  const onPaginationChange = (e) => {
    getRecordList(onlyCreator, "", e, pageSize)
  }

  const showItem = (title, content) => {
    setTextModalTitle(title)
    setTextModalContent(content)
    setTextModal(true)
  }

  return (
    <>
      <Fieldset label="会议记录" value="record">
        <div style={{display: "flex", alignItems: "center"}}>
          <Input icon={<Search />} placeholder="通过会议名称搜索" clearable
                 onChange={e => {
                   setPage(1)
                   setWord(e.target.value)
                   getRecordList(onlyCreator, e.target.value, 1, pageSize)
                 }} />
          <Spacer w={1} />
          <Select initialValue="1"
                  onChange={v => {
                    setOnlyCreator(v === "2")
                    setPage(1)
                    getRecordList(v === "2", word, 1, pageSize)
                  }}>
            <Select.Option value="1">我加入的</Select.Option>
            <Select.Option value="2">我创建的</Select.Option>
          </Select>
        </div>
        <Spacer h={1} />
        {loading
          ? <Loading spaceRatio={2} />
          : (<>
            <Table data={records}>
              <Table.Column prop="title" label="会议名称" />
              <Table.Column prop="docHtml" label="交互板内容" />
              <Table.Column prop="noteHtml" label="笔记内容" />
              <Table.Column prop="compileRecordHtml" label="运行记录" />
              <Table.Column prop="joinAt" label="加入时间" width={200} />
              <Table.Column prop="quitAt" label="退出时间" width={200} />
            </Table>
            {total <= 0 && <Text p small style={{textAlign: "center", color: "#666"}}>无筛选结果</Text>}
          </>)
        }
        <Fieldset.Footer style={{display: "flex", justifyContent: "center"}}>
          <Pagination count={total} page={page} onChange={onPaginationChange}>
            <Pagination.Next><ChevronRight /></Pagination.Next>
            <Pagination.Previous><ChevronLeft /></Pagination.Previous>
          </Pagination>
        </Fieldset.Footer>
      </Fieldset>

      <Modal width="700px" visible={showTextModal} onClose={() => setTextModal(false)}>
        <Modal.Title>{textModalTitle}</Modal.Title>
        <Modal.Content>
          <Textarea initialValue={textModalContent} readOnly width="100%" height="200px" />
        </Modal.Content>
      </Modal>

      <Modal width="800px" visible={showCompileModal} onClose={() => setCompileModal(false)}>
        <Modal.Title>运行记录</Modal.Title>
        <Modal.Content>
          <CompileRecord meetingUUID={compileModalUUID} />
        </Modal.Content>
      </Modal>
    </>
  )
}

export default MeetingRecord
