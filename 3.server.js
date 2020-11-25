const Koa = require('./koa')
// const Koa = require('koa')
const app = new Koa()
const fs = require('fs')
app.use(async ctx => {
  ctx.setType('text/plain;charset=utf8')
  ctx.body = fs.createReadStream('./requirements.md', { encoding: 'utf-8' })
})
app.on('error', err => {
  console.log(err, '----')
})
app.listen(8080)
