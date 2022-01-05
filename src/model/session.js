import { API, HTTP } from '../util/http'

export class Session {
  login = ({username, password, mobile, email}) => new Promise(((resolve, reject) => {
    HTTP.post(API.userLogin, {
      username: username,
      password: password,
      mobile: mobile,
      email: email
    }).then(res => {
      Reflect.set(res.data.jwt, "expireAt", (new Date().getTime() + res.data.jwt.expires_in * 1000))
      this.setInfo(res.data)
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  logout = () => new Promise(((resolve, reject) => {
    HTTP.post(API.userLogOut).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  session = () => new Promise(((resolve, reject) => {
    HTTP.post(API.userSession).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  offline = ({signature}) => new Promise(((resolve, reject) => {
    HTTP.post(API.userOffline, {
      signature: signature
    }).then(res => {
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  signUp = ({username, name, password, mobile, email}) => new Promise(((resolve, reject) => {
    HTTP.post(API.userSignUp, {
      username: username,
      name: name,
      password: password,
      mobile: mobile,
      email: email,
    }).then(res => {
      Reflect.set(res.data.jwt, "expireAt", (new Date().getTime() + res.data.jwt.expires_in * 1000))
      this.setInfo(res.data)
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  refreshToken = () => new Promise(((resolve, reject) => {
    if (window.refreshingToken) return
    window.refreshingToken = true
    HTTP.post(API.userRefreshToken, {
      refreshToken: this.getInfo()?.jwt?.refresh_token,
    }).then(res => {
      let temp = this.getInfo()
      temp.jwt = res.data
      Reflect.set(temp.jwt, "expireAt", (new Date().getTime() + res.data.expires_in * 1000))
      this.setInfo(temp)
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    }).finally(()=>{
      window.refreshingToken = false
    })
  }))

  edit = ({name, email}) => new Promise(((resolve, reject) => {
    HTTP.post(API.userEdit, {
      name: name,
      email: email
    }).then(res => {
      let temp = this.getInfo()
      temp.user = res.data
      this.setInfo(temp)
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  changePwd = ({oldPwd, newPwd}) => new Promise(((resolve, reject) => {
    HTTP.post(API.userChangePwd, {
      old: oldPwd,
      new: newPwd
    }).then(res => {
      this.clearInfo()
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  getInfo = () => JSON.parse(sessionStorage.getItem('sessionInfo'))

  setInfo = (data) => sessionStorage.setItem('sessionInfo', JSON.stringify(data))

  clearInfo = () => sessionStorage.removeItem("sessionInfo")

  isLogin = () => JSON.parse(sessionStorage.getItem('sessionInfo')) !== null

  isMe = (uuid) => {
    return this.getInfo()?.user?.uuid === uuid
  }
}
