import { API, HTTP } from '../util/http'

export class Judge {
  commit = ({meetingUUID, typeID, code}) => new Promise(((resolve, reject) => {
    HTTP.post(API.judgeCommit, {
      meetingUUID: meetingUUID,
      typeID: typeID,
      code: code,
    }).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  record = ({meetingUUID, pageNum, pageSize}) => new Promise(((resolve, reject) => {
    HTTP.post(API.judgeRecord, {
      meetingUUID: meetingUUID,
      pageNum: pageNum,
      pageSize: pageSize,
    }).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  binary = ({attachmentUUID}) => new Promise(((resolve, reject) => {
    HTTP.get(
      API.judgeBinary + attachmentUUID
    ).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  result = ({attachmentUUID}) => new Promise(((resolve, reject) => {
    HTTP.get(
      API.judgeResult + attachmentUUID
    ).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))
}
