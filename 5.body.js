// 数据提交了 服务端应该接收数据 进行响应
// 获取用户数据进行操作
const Koa = require('koa')
const app = new Koa()
const path = require('path')
// koa-bodyparser koa-static
const bodyParser = require('./koa-bodyparser')
const static = require('./koa-static')


// 当用户访问/login的时候 get  => 返回一个登录页
app.use(bodyParser(path.join(__dirname, 'upload')))

// 当用户访问/login  post => 做登录操作

app.use(async (ctx, next) => {
  if (ctx.path === '/login' && ctx.method == 'POST') {
    // 读取用户传递的数据
    ctx.set('Content-Type', 'text/html')
    ctx.body = ctx.request.body
  } else {
    await next()
  }
})

// 静态文件服务中间件 处理静态资源的
app.use(static(path.resolve(__dirname, 'koa')))
app.use(static(__dirname))

app.listen(8080)
