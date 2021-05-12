const router = require('koa-router')()
const fs = require('fs')
const path = require('path')

const tools = require('../../../../../utils/tools')

router.get('/gasLimit', async ctx => {
  const genesisPath = path.resolve(tools.rootPath(), '..', 'chain', 'genesis.json')
  const genesis = JSON.parse(fs.readFileSync(genesisPath, 'utf-8'))
  ctx.body = {
    result: {
      gasLimit: ctx.state.web3.utils.hexToNumber(genesis.gasLimit)
    }
  }
})

module.exports = router
