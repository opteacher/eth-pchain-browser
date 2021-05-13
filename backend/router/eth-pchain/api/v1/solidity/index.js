const router = require('koa-router')()
const fs = require('fs')
const path = require('path')
const solc = require('solc')

const tools = require('../../../../../utils/tools')

router.get('/json', async ctx => {
  const solPath = ctx.request.query.solPath
  // 读取合约文件的内容
  const pathInfo = path.parse(solPath)
  const fileName = pathInfo.base
  // 检查是否生成过
  try {
    const ctrtName = pathInfo.name
    const jsonPath = path.resolve(tools.rootPath(), '..', 'chain', 'solidities', `output_${ctrtName}.json`)
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    if (jsonData.abi && jsonData.bytecode) {
      ctx.body = {
        result: {
          [ctrtName]: Object.assign(jsonData, {jsonPath})
        }
      }
      return
    }
  } catch (err) {
    if (err && err.code !== 'ENOENT') {
      throw err
    }
  }
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
  if (!output.contracts || !output.contracts[fileName]) {
    ctx.body = {
      error: '构建合约失败！solidity文件存在错误'
    }
    return
  }
  const contracts = output.contracts[fileName]
  let result = {}
  for (const contractName in contracts) {
    const jsonPath = path.resolve(pathInfo.dir, `output_${contractName}.json`)
    result[contractName] = {
      abi: contracts[contractName].abi,
      bytecode: contracts[contractName].evm.bytecode.object
    }
    // 保存输出结果到文件中
    fs.writeFileSync(jsonPath, JSON.stringify(result[contractName]))
    result[contractName].jsonPath = jsonPath
  }
  ctx.body = {result}
})

router.get('/address/:address', async ctx => {
  const address = ctx.params.address.toLowerCase()
  const outputsPath = path.resolve(...[
    tools.rootPath(), '..', 'chain', 'solidities'
  ])
  const jsonFiles = tools.scanPath(outputsPath, {ext: 'json'})
  for (const jsonFile of jsonFiles) {
    const jsonPath = path.resolve(outputsPath, jsonFile)
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    const addrInFile = jsonData.receipt && jsonData.receipt.contractAddress.toLowerCase()
    if (addrInFile === address) {
      const name = path.parse(jsonPath).name.replace('output_', '')
      let ctrtIns = null
      try {
        ctrtIns = new ctx.state.web3.eth.Contract( jsonData.abi, address)
      } catch (e) {
        ctx.body = {
          error: e.message || JSON.stringify(e)
        }
      }
      let decimals = -1
      try {
        decimals = parseInt(await ctrtIns.methods['decimals']().call())
      } catch (e) {
        console.log (e.message || JSON.stringify(e))
      }
      let owner = ''
      try {
        owner = await ctrtIns.methods['owner']().call()
      } catch (e) {
        console.log (e.message || JSON.stringify(e))
      }
      let symbol = ''
      try {
        symbol = await ctrtIns.methods['symbol']().call()
      } catch (e) {
        console.log (e.message || JSON.stringify(e))
      }
      let totalSupply = -1
      try {
        totalSupply = parseInt(await ctrtIns.methods['totalSupply']().call())
      } catch (e) {
        console.log (e.message || JSON.stringify(e))
      }
      ctx.body = {
        result: {
          name, address, symbol, owner, decimals, totalSupply
        }
      }
      return
    }
  }
  ctx.body = {
    result: ''
  }
})

module.exports = router
