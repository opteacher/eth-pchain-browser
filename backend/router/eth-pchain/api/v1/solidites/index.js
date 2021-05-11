const router = require('koa-router')()
const path = require('path')

const tools = require('../../../../../utils/tools')

router.get('/', async ctx => {
  const basePath = path.resolve('..', 'chain', 'solidities')
  const solPaths = tools.scanPath(basePath, {ext: '.sol'})
  const result = {}
  solPaths.map(solPath => {
    result[path.parse(solPath).name] = path.resolve(basePath, solPath)
  })
  ctx.body = {result}
})

module.exports = router
