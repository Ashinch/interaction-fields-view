import axios from 'axios'
import * as QueryString from "querystring"

export const HTTP = axios.create()

HTTP.interceptors.request.use(
  (config) => {
    console.log(config)
    config.headers = {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      'Authorization': sessionStorage.getItem('sessionInfo') && "Bearer " + JSON.parse(sessionStorage.getItem('sessionInfo'))?.jwt?.access_token
    }
    config.data = QueryString.stringify(config.data)
    return config
  },
  (err) => {
    console.error('请求超时', err)
    return Promise.reject(err)
  }
)

HTTP.interceptors.response.use(
  (data) => {
    console.info(data)
    if (data.data.code === 200) {
      return Promise.resolve(data.data)
    } else {
      return Promise.reject(data.data)
    }
  },
  (err) => {
    console.error(err)
    return Promise.reject(err)
  }
)

const PREFIX = '/api'

export const API = {
  userLogin: PREFIX + '/user-service/login',
  userSignUp: PREFIX + '/user-service/signUp',
  meetingCreate: PREFIX + '/meeting-service/create',
  meetingStatusByCode: PREFIX + '/meeting-service/statusByCode/',
  judgeCommit: PREFIX + '/judge-service/commit',
  judgeRecord: PREFIX + '/judge-service/record',
}