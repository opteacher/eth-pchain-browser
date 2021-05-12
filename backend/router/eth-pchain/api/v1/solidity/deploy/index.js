const router = require('koa-router')()
const fs = require('fs')
const path = require('path')

const tools = require('../../../../../../utils/tools')

router.get('/gas', async ctx => {
  const ctrtJson = JSON.parse(
    fs.readFileSync(ctx.request.query.jsonPath, 'utf-8') || '{}'
  )
  ctx.body = {
    result: {
      // 使用三倍的estimateGas数
      gas: (await ctx.state.web3.eth.estimateGas({
        data: ctrtJson.bytecode
      })) * 3
    }
  }
})

router.post('/', async ctx => {
  const genesisPath = path.resolve(tools.rootPath(), '..', 'chain', 'genesis.json')
  const genesis = JSON.parse(fs.readFileSync(genesisPath, 'utf-8'))
  // 建立区块链通讯，发布合约
  const ctrtJson = JSON.parse(
    fs.readFileSync(ctx.request.body.jsonPath, 'utf-8') || '{}'
  )
  if (ctrtJson.receipt) {
    ctx.body = {
      result: ctrtJson.receipt
    }
  }
  const account = ctx.request.body.accAddr
  const password = ctx.request.body.accPswd
  ctrtJson.bytecode = '0x' + ctrtJson.bytecode
  // 如果gas大于上限，使用上限gas
  let gas = ctx.request.body.gas
  const gasLimit = ctx.state.web3.utils.hexToNumber(genesis.gasLimit)
  if (gas > gasLimit) {
    gas = gasLimit
  }
  // 创建合约实例
  const ctrtIns = new ctx.state.web3.eth.Contract(ctrtJson.abi)
  // 解锁支付账户
  await ctx.state.web3.eth.personal.unlockAccount(account, password, 1000)
  // 部署
  let result = null
  try {
    await ctrtIns.deploy({
      data: ctrtJson.bytecode
    }).send({
      from: account, gas
    }).on('error', error => {
      throw(error)
    }).on('receipt', receipt => {
      fs.writeFileSync(ctx.request.body.jsonPath, JSON.stringify(
        Object.assign(ctrtJson, {receipt})
      ))
      result = receipt
    })
  } catch (e) {
    ctx.body = {
      error: e.message || JSON.stringify(e)
    }
    return
  }
  ctx.body = {result}
})

module.exports = router
