import { API, HTTP } from '../config/http'

export class Meeting {
  statusByCode = ({code}) => new Promise(((resolve, reject) => {
    HTTP.get(
      API.meetingStatusByCode + code
    ).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))
}
