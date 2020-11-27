class Layer {
  constructor (method, pathname, handler) {
    this.method = method
    this.pathname = pathname
    this.handler = handler
  }
  match (pathname, method) {
    return pathname === this.pathname && method.toLowerCase() === this.method
  }
}

class Router {
  constructor () {
    // 路由也有中间件,所以koa和路由加起来就是两层中间件
    this.layers = []
  }
  get (pathname, handler) {
    const layer = new Layer('get', pathname, handler)
    this.layers.push(layer)
  }

  // compose函数的作用
  compose (fns, ctx, out) {
    const dispatch = index => {
      if (index >= fns.length) return out()
      const handler = fns[index].handler
      return Promise.resolve(handler(ctx, () => dispatch(index + 1)))
    }

    return dispatch(0)
  }

  /**
   * routes的作用是将注册的路由中间件compose之后返回,返回的是一个供koa使用的中间件
   */
  routes () {
    return async (ctx, next) => {
      const path = ctx.path
      const method = ctx.method
      const fns = this.layers.filter(layer => layer.match(path, method))
      // 将匹配的路由中间件传入给compose函数
      return this.compose(fns, ctx, next)
    }
  }
}

module.exports = Router
