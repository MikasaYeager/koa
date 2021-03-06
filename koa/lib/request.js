const url = require('url')

module.exports = {
  get path () {
    const { pathname } = url.parse(this.req.url)
    return pathname
  },
  get query () {
    const { query } = url.parse(this.req.url, true)
    return query
  }
}
