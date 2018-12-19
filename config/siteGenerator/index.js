const path = require('path')
const { toPOSIXPath } = require('../../lib/path')
const { basePath, destBaseDir } = require('../path')
const { inputDir } = require('./settings')
const task = require('./task')

module.exports = {
  inputDir,
  inputExt: '.pug',
  outputDir: destBaseDir,
  outputExt: '.html',
  task,
  basePath: toPOSIXPath(path.join('/', basePath)),
}
