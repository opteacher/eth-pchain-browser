const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const json = require('koa-json')
const logger = require('koa-logger')
const cors = require('koa2-cors')

const router = require('./router/index')

const app = new Koa()

// 跨域配置
app.use(cors())
// 路径解析
app.use(bodyparser())
// json解析
app.use(json())
// 日志输出
app.use(logger())
// 路径分配
app.use(router.routes(), router.allowedMethods())

app.listen(process.env.PORT || 4000)
