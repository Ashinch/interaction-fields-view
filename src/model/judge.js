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

  record = ({meetingUUID}) => new Promise(((resolve, reject) => {
    HTTP.post(API.judgeRecord, {
      meetingUUID: meetingUUID,
    }).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))
}
