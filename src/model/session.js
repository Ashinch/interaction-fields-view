import { API, HTTP } from '../config/http'

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

  getInfo = () => JSON.parse(sessionStorage.getItem('sessionInfo'))

  setInfo = (data) => sessionStorage.setItem('sessionInfo', JSON.stringify(data))

  isLogin = () => JSON.parse(sessionStorage.getItem('sessionInfo')) !== null

  isMe = (uuid) => {
    console.log("uuid", uuid)
    return this.getInfo()?.user?.uuid === uuid
  }
}
