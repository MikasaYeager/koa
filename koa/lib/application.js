const http = require('http')
const Stream = require('stream')
const context = require('./context')
const request = require('./request')
const response = require('./response')
const EventEmitter = require('events')

// application是基于事件的
class Application extends EventEmitter {
  constructor () {
    super()
    this.context = Object.create(context)
    this.request = Object.create(request)
    this.response = Object.create(response)
    this.middlewares = []
  }

  use (fn) {
    typeof fn === 'function' && this.middlewares.push(fn)
  }

  createContext (req, res) {
    const ctx = Object.create(this.context)
    const request = Object.create(this.request)
    const response = Object.create(this.response)

    ctx.request = request
    ctx.response = response
    ctx.request.req = req
    ctx.response.res = res
    return ctx
  }

  compose (ctx, next) {
    let index = -1
    const dispatch = i => {
      if (i <= index) {
        return Promise.reject('multiple call next()')
      }
      // 为了防止多次调用同一个next函数,每次执行完之后都会赋值,如果调用next多次,那么就会报错
      index = i
      const middleware = this.middlewares[i]
      if (i >= this.middlewares.length) middleware = next
      if (!middleware) return Promise.resolve()

      // 其实主要的就是这一行代码
      // 无论中间件是不是异步,dispatch返回的都是一个promise
      // 执行dispatch之后index会自增,所以next永远都是下一个中间件
      // 执行完dispatch之后如果中间件里面执行next的话,会递归的去执行里面的dispatch
      // 其实用promise包裹的主要原因是为了能捕获错误并且能生成一个promise
      // 不过只能捕获同步错误
      try {
        return Promise.resolve(middleware(ctx, () => dispatch(i + 1)))
      } catch (error) {
        return Promise.reject(error)
      }
    }
    // 如果第一次执行的dispatch()返回值是一个promise
    // 它会等待这个promise状态被决定的时候执行then注册的回调
    // async的返回值也是一个promise
    // 意思就是说第一个中间件如果await next()或者return next()
    return dispatch(0)

    // let index = -1
    // const middlewares = this.middlewares
    // function dispatch (i) {
    //   if (i <= index)
    //     return Promise.reject(new Error('next() called multiple times'))
    //   index = i
    //   let fn = middlewares[i]
    //   if (i === middlewares.length) fn = next
    //   if (!fn) return Promise.resolve()
    //   try {
    //     return Promise.resolve(fn(ctx, () => dispatch(i + 1)))
    //   } catch (err) {
    //     console.log('err: ', err)
    //     return Promise.reject(err)
    //   }
    // }
    // return dispatch(0)
  }

  handle (req, res) {
    console.log('请求来啦')
    // 每次都生成一个新的上下文,防止用户篡改
    const ctx = this.createContext(req, res)
    res.statusCode = 404
    this.compose(ctx)
      .then(() => {
        let _body = ctx.body
        if (typeof _body === 'string' || Buffer.isBuffer(_body)) {
          return res.end(_body)
        }
        if (typeof _body === 'number') {
          return res.end(_body + '')
        }
        if (_body instanceof Stream) {
          return _body.pipe(res)
        }
        if (typeof _body === 'object') {
          return res.end(JSON.stringify(_body))
        }
        res.end('Not Found')
      })
      .catch(err => {
        this.emit('error', err)
      })
  }

  listen (...args) {
    const server = http.createServer(this.handle.bind(this))
    server.listen(...args)
  }
}

module.exports = Application
