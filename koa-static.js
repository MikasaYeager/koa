const path = require('path')
const fsPromises = require('fs').promises
const mime = require('mime')
const { createReadStream } = require('fs')

module.exports = function koaStatic (dirName) {
  return async (ctx, next) => {
    let filePath = path.join(dirName, ctx.path)
    try {
      const statObj = await fsPromises.stat(filePath)
      if (statObj.isFile()) {
        ctx.set('Content-Type', mime.getType(filePath) + ';charset=urf8')
        ctx.body = createReadStream(filePath)
      } else {
        await next()
      }
    } catch (error) {
      await next()
    }
  }
}
