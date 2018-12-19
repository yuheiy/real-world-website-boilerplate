const fs = require('fs')
const util = require('util')

const readFileAsync = util.promisify(fs.readFile)

module.exports = {
  readFileAsync,
}
