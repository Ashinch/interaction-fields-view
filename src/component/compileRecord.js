import { forwardRef, useEffect, useState } from "react"
import "../util/bee.js"
import { Link, Page, Spinner, Table } from "@geist-ui/react"
import { Model } from "../model/model"
import { interactClose, interactInit } from "../model/interact"

const CompileRecord = ({meetingUUID}) => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Model.judge.record({
      meetingUUID: meetingUUID
    }).then((res) => {
      res.data.map((item) => {
        item.language = item.type.name.split("/")[1]
        item.status = <font color={item.status.id === 1 ? "green" : "red"}>{item.status.name}</font>
        item.commit = <Link color>查看</Link>
        item.output = <Link color>查看</Link>
      })
      setRecords(res.data)
      // setLoading(false)
    }).catch((err) => {
      // setToast({text: `${err.msg ? err.msg : err}`, type: "error"})
      // history.push("/")
    }).finally(
      setLoading(false)
    )

    return () => {
    }
  }, [])

  return loading ? <Spinner style={{position: "relative", top: 100, left: "50%"}} /> : (
    <>
      <Table data={records}>
        <Table.Column prop="uuid" label="编号" />
        <Table.Column prop="language" label="目标语言" />
        <Table.Column prop="status" label="状态" />
        <Table.Column prop="elapsedTime" label="耗时（毫秒）" />
        <Table.Column prop="commit" label="提交代码" />
        <Table.Column prop="output" label="输出结果" />
      </Table>

      <style jsx="true">{`

      `}</style>
    </>
  )
}

export default CompileRecord
