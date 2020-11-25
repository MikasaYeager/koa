const proto = {
  setType (value) {
    this.response.res.setHeader('Content-Type', value)
  }
}

module.exports = proto

function defineGetter (target, key) {
  proto.__defineGetter__(key, function () {
    return this[target][key]
  })
}

function defineSetter (target, key) {
  proto.__defineSetter__(key, function (value) {
    console.log('key: ', key)
    this[target][key] = value
  })
}

// 对ctx上面一些属性做读取的代理
defineGetter('request', 'path')
defineGetter('request', 'req')
defineGetter('request', 'url')
defineGetter('response', 'body')
defineSetter('response', 'body')
