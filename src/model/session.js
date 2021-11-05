import { API, HTTP } from '../util/http'

export class Session {
  login = ({username, password, mobile, email}) => new Promise(((resolve, reject) => {
    HTTP.post(API.userLogin, {
      username: username,
      password: password,
      mobile: mobile,
      email: email
    }).then(res => {
      this.setInfo(res.data)
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
    })
  }))

  logout = ({username, password}) => new Promise(((resolve, reject) => {
    HTTP.delete(API.userLogout, {
      username: username,
      password: password,
    }).then(res => {
      this.clearInfo()
      resolve && resolve(res)
    }).catch(err => {
      reject && reject(err)
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
