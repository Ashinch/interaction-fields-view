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
    console.log('请求超时')
    return Promise.reject(err)
  }
)

HTTP.interceptors.response.use(
  (data) => {
    console.log(data)
    if (data.data.code === 200) {
      return Promise.resolve(data.data)
    } else {
      return Promise.reject(data.data)
    }
  },
  (err) => {
    if (err.response.status === 504 || err.response.status === 404) {
      console.log('服务器被吃了⊙﹏⊙∥', err)
    } else if (err.response.status === 401) {
      console.log('登录信息失效⊙﹏⊙∥', err)
    } else if (err.response.status === 500) {
      console.log('服务器开小差了⊙﹏⊙∥', err)
    }
    return Promise.reject(err)
  }
)

export const API = {
  userLogin: '/user-service/login',
  userSignUp: '/user-service/signUp',
  meetingCreate: '/meeting-service/create',
  meetingCodeStatus: '/meeting-service/codeStatus/',
}
