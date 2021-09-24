import { API, HTTP } from '../util/http'

export class Judge {
  commit = ({code, meetingUUID}) => new Promise(((resolve, reject) => {
    HTTP.post(API.judgeCommit, {
      code: code,
      meetingUUID: meetingUUID,
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
