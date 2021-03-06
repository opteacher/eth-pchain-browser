import axios from 'axios'
import global from './store'

axios.defaults.baseURL = '/chain' // 开发本地代理
axios.defaults.headers.post['Contenst-Type'] = 'application/json;'

function procsRespRes (resp, errMsg) {
  if (resp.data.result === undefined) {
    global.store.state.curVue.$notification['error']({
      duration: null,
      message: resp.data.error || errMsg,
      description: resp.data.error.message
    })
    return null
  } else {
    return resp.data.result
  }
}

export default {
  async reqChain (method, params = []) {
    const resp = await axios.post('/', {
      id: 15, method, params, jsonrpc: '2.0'
    })
    return procsRespRes(resp, '转账错误！')
  },
  async reqBackend (path, method, body = undefined) {
    if (path[0] !== '/') {
      path = '/' + path
    }
    const resp = await axios[method](`http://localhost:4000${path}`, body)
    return procsRespRes(resp, '请求后台失败！')
  },
  toNum (strNum, justRate = true, decimal = 18) {
    return parseInt(strNum, 16) / (justRate ? Math.pow(10, decimal) : 1)
  },
  toHex (weiNum, justRate = true, decimal = 18) {
    return '0x' + (weiNum * (justRate ? Math.pow(10, decimal) : 1)).toString(16)
  },
  fmtHex (hex) {
    const h0x = hex.startsWith('0x') ? '0x' : ''
    let valIdx = h0x ? 2 : 0
    for (let i = valIdx; i < hex.length; ++i) {
      if (hex[i] !== '0') {
        valIdx = i
        break
      }
    }
    return h0x + hex.substring(valIdx)
  }
}
