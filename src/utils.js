import axios from 'axios'

axios.defaults.baseURL = '/chain' // 开发本地代理
axios.defaults.headers.post['Contenst-Type'] = 'application/json;'

export default {
  async reqChain (method, params = []) {
    const resp = await axios.post('/', {
      id: 15,
      method,
      params,
      jsonrpc: '2.0'
    })
    if (!resp.data) {
      console.log(resp.error.message)
      return null
    } else {
      return resp.data.result
    }
  },
  toWei (strNum, justRate = true) {
    return parseInt(strNum, 16) / (justRate ? Math.pow(10, 18) : 1)
  },
  fromWei (weiNum, justRate = true) {
    return '0x' + (weiNum * (justRate ? Math.pow(10, 18) : 1)).toString(16)
  }
}
