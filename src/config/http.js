import axios from 'axios'
import * as QueryString from "querystring"

export const HTTP = axios.create()

HTTP.interceptors.request.use(
  (config) => {
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

export const API = {
  userLogin: '/user-service/login',
  userSignUp: '/user-service/signUp',
  meetingCreate: '/meeting-service/create',
  meetingCodeStatus: '/meeting-service/codeStatus/',
}
