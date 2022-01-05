import axios from 'axios'
import * as QueryString from "querystring"
import { Model } from "../model/model"

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
    console.info(data.config.method, data.config.url, data.data)
    if (data.data.code === 200) {
      if (Model.session.isLogin() && data.config.url !== API.userRefreshToken
        && Model.session.getInfo()?.jwt?.expireAt - new Date().getTime() < 1000 * 60 * 60 * 12) {
        // 距离令牌过期时间小于12小时，刷新令牌
        console.info("刷新令牌")
        Model.session.refreshToken()
      }
      return Promise.resolve(data.data)
    } else if (data.data.code === 2005) {
      // setTimeout(() => {
      //   Model.session.clearInfo()
      //   window.location.href = '/'
      // }, 1000)
      return Promise.reject(data.data)
    } else {
      console.error(data.data)
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
  userLogOut: PREFIX + '/user-service/logOut',
  userSession: PREFIX + '/user-service/session',
  userOffline: PREFIX + '/user-service/offline',
  userSignUp: PREFIX + '/user-service/signUp',
  userRefreshToken: PREFIX + '/user-service/refreshToken',
  userEdit: PREFIX + '/user-service/edit',
  userChangePwd: PREFIX + '/user-service/changePwd',
  meetingCreate: PREFIX + '/meeting-service/create',
  meetingClose: PREFIX + '/meeting-service/close',
  meetingStatusByCode: PREFIX + '/meeting-service/statusByCode',
  meetingStatusByUser: PREFIX + '/meeting-service/statusByUser',
  meetingRecord: PREFIX + '/meeting-service/record',
  judgeCommit: PREFIX + '/judge-service/commit',
  judgeRecord: PREFIX + '/judge-service/record',
  judgeBinary: PREFIX + '/judge-service/binary/',
  judgeResult: PREFIX + '/judge-service/result/',
}
