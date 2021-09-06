import { API, HTTP } from '../config/http'

export class Meeting {
  codeStatus = ({code}) => new Promise(((resolve, reject) => {
    HTTP.get(
      API.meetingCodeStatus + code
    ).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))
}
