const buf1 = Buffer.from('今天晚上')
const buf2 = Buffer.from('打老虎')
const buf = Buffer.alloc(24)

// copy功能
// buf1.copy(buf, 0, 0)
// buf2.copy(buf, 12, 0)
// console.log(buf.toString())

// function bufferCopy (
//   source,
//   target,
//   targetStart = 0,
//   sourceStart = 0,
//   sourceEnd = source.length
// ) {
//   for (let index = 0; index < sourceEnd - sourceStart; index++) {
//     target[targetStart + index] = source[sourceStart + index]
//   }
// }

// bufferCopy(buf1, buf, 0, 0)
// bufferCopy(buf2, buf, 12, 0)
// console.log(buf.toString())
