const Koa = require('./koa')
// const Koa = require('koa')
const app = new Koa()
const fs = require('fs')
app.use(async ctx => {
  ctx.body = fs.createReadStream('./package1.json')
})
app.on('error', err => {
  console.log('----')
})

app.listen(8080)
