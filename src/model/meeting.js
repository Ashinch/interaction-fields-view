import { API, HTTP } from '../util/http'

export class Meeting {
  create = ({title}) => new Promise(((resolve, reject) => {
    HTTP.post(API.meetingCreate, {
      title: title
    }).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  close = () => new Promise(((resolve, reject) => {
    HTTP.post(API.meetingClose, null).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  statusByCode = ({code}) => new Promise(((resolve, reject) => {
    HTTP.post(API.meetingStatusByCode, {
      code: code
    }).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  statusByUser = () => new Promise(((resolve, reject) => {
    HTTP.post(API.meetingStatusByUser).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  record = ({onlyCreator, word, pageNum, pageSize}) => new Promise(((resolve, reject) => {
    HTTP.post(API.meetingRecord, {
      onlyCreator: onlyCreator,
      word: word,
      pageNum: pageNum,
      pageSize: pageSize,
    }).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))
}
