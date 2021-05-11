const router = require('koa-router')()
const fs = require('fs')
const path = require('path')
const solc = require('solc')
const Web3 = require('web3')

// const tools = require('../../../../../utils/tools')

router.post('/deploy', async ctx => {
  const solPath = ctx.request.body.solPath
  // 读取合约文件的内容
  const pathInfo = path.parse(solPath)
  const fileName = pathInfo.base
  const content = fs.readFileSync(solPath, 'utf-8')
  // 输入源
  const input = {
    language: 'Solidity',
    sources: {
      [fileName]: {content}
    },
    settings: {
      outputSelection: {
        '*': {'*': ['*']}
      }
    }
  }
  // 编译输出
  const output = JSON.parse(solc.compile(JSON.stringify(input)))
  // 提取输出结果中的abi和bytecode
  const contracts = output.contracts[fileName]
  let jsonResult = {}
  for (const contractName in contracts) {
    jsonResult[contractName] = {
      abi: contracts[contractName].abi,
      bytecode: contracts[contractName].evm.bytecode.object
    }
  }
  // 保存输出结果到文件中
  fs.writeFileSync(path.resolve(pathInfo.dir, 'output.json'), JSON.stringify(jsonResult))
  // 建立区块链通讯，发布合约
  const web3 = new Web3('ws://localhost:8546')
  const account = ctx.request.body.accAddr
  const password = ctx.request.body.accPswd
  let result = {}
  for (const contractName in jsonResult) {
    const ctrtParams = jsonResult[contractName]
    ctrtParams.bytecode = '0x' + ctrtParams.bytecode
    // 计算发布合约所用Gas费
    let gas = await web3.eth.estimateGas({
      data: ctrtParams.bytecode
    })
    // @_@：算出来的gas有点问题
    gas = gas * 10
    // 创建合约实例
    const ctrtIns = new web3.eth.Contract(ctrtParams.abi)
    // 解锁支付账户
    await web3.eth.personal.unlockAccount(account, password, 1000)
    // 部署
    await ctrtIns.deploy({
      data: ctrtParams.bytecode
    }).send({
      from: account, gas
    }).on('error', error => {
      console.log(error)
      ctx.body = {error}
    }).on('receipt', receipt => {
      result[contractName] = receipt
    })
  }
  ctx.body = {result}
})

module.exports = router
