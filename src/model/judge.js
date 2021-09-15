import { API, HTTP } from '../config/http'

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
}
