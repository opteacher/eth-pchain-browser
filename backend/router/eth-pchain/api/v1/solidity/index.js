const router = require('koa-router')()
const fs = require('fs')
const path = require('path')
const solc = require('solc')

// const tools = require('../../../../../utils/tools')

router.get('/json', async ctx => {
  const solPath = ctx.request.query.solPath
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

module.exports = router
