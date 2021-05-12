const router = require('koa-router')()
const fs = require('fs')
const path = require('path')

const tools = require('../../../../../../utils/tools')

router.post('/:method', async ctx => {
  const ctrtName = ctx.request.body.contractName
  const ctrtAddr = ctx.request.body.contractAddr
  const params = ctx.request.body.params || []
  const method = ctx.params.method
  const ctrtFileName = `output_${ctrtName}.json`
  const solPath = path.resolve(tools.rootPath(), '..', 'chain', 'solidities', ctrtFileName)
  let result = {}
  try {
    const solJson = JSON.parse(fs.readFileSync(solPath, 'utf-8'))
    const ctrtIns = new ctx.state.web3.eth.Contract(solJson.abi, ctrtAddr)
    result = await ctrtIns.methods[method](...params).call()
  } catch (err) {
    ctx.body = {
      error: err.message || JSON.stringify(err)
    }
    return
  }
  ctx.body = {result}
})

module.exports = router
