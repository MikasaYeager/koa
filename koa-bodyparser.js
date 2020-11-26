const queryString = require('querystring')
const uuid = require('uuid')
const fs = require('fs')
const path = require('path')

async function body (ctx, uploadDir) {
  return new Promise((resolve, reject) => {
    const buf = []
    ctx.req.on('data', function (chunk) {
      buf.push(chunk)
    })

    ctx.req.on('end', function () {
      try {
        const type = ctx.get('content-type')
        const data = Buffer.concat(buf)
        if (type === 'application/x-www-form-urlencoded') {
          return resolve(queryString.parse(data.toString()))
        }

        if (type === 'application/json') {
          return resolve(JSON.parse(data.toString()))
        }

        if (type === 'text/palin') {
          return resolve(buf.toString())
        }

        if (type.startsWith('multipart/form-data')) {
          // 获取formData的分隔符
          const boundary = '--' + type.split('=')[1]
          // 分隔符分割的字段要去掉头尾才是真正的内容部分
          const lines = data.split(boundary).slice(1, -1)
          const result = {}
          lines.forEach(line => {
            // 实体头部和内容是用\r\n\r\n来分隔的
            const [head, body] = line.split('\r\n\r\n')
            if (head) {
              const key = head.toString().match(/name="(.+?)"/)[1]
              if (!head.includes('filename')) {
                // 如果没有包含filename,那么这个字段就是一个普通的文本字段,直接截取就好
                result[key] = body.slice(0, -2).toString()
              } else {
                const originalName = head
                  .toString()
                  .match(/filename="(.+?)"/)[1]
                const filename = uuid.v4()
                const content = body.slice(0, -2)
                fs.writeFileSync(path.join(uploadDir, filename), content)
                result[key] = result[key] || []
                result[key].push({
                  size: content.length,
                  name: originalName,
                  filename
                })
              }
            }
          })
          return resolve(result)
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  })
}

Buffer.prototype.split = function (bondary) {
  // 分割二进制
  let arr = []
  let offset = 0
  let currentPosition = 0
  // 找到当前分隔符的位置 只要能找到就一直查找
  while (-1 != (currentPosition = this.indexOf(bondary, offset))) {
    arr.push(this.slice(offset, currentPosition))
    offset = currentPosition + bondary.length
  }
  arr.push(this.slice(offset))
  return arr
}

module.exports = function bodyParser (uploadDir) {
  return async (ctx, next) => {
    ctx.request.body = await body(ctx, uploadDir)
    return next()
  }
}
