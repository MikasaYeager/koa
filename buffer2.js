const buf = Buffer.from('斯人若彩虹你好遇上方知有')
function splitBuffer (buf, splitor) {
  const results = []
  // 要用byteLength来计算分隔符的长度,而不能用length
  const splitorLength = Buffer.byteLength(splitor)
  // 截取的起始点
  let offset = 0
  // 分隔符的起点
  let pos = 0
  while (-1 !== (pos = buf.indexOf(splitor, offset))) {
    results.push(buf.slice(offset, pos))
    // 起始点需要重新设置
    offset += pos + splitorLength
  }
  // 找不到分隔符之后需要将末尾的数据添加进去
  results.push(buf.slice(offset))
  return results
}

console.log(splitBuffer(buf, '你好')[0].toString())
console.log(splitBuffer(buf, '你好')[1].toString())
