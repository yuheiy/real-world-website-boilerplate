const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const config = require('../realworld.config')

const isProd = process.argv[2] === 'build'

const basePath = config.basePath || ''
const baseUrl = config.baseUrl || 'http://example.com'

const assetPath = path.join(basePath, 'assets')
const destDir = isProd ? 'dist' : 'tmp'
const destBaseDir = path.join(destDir, basePath)
const destAssetDir = path.join(destDir, assetPath)

const readFileAsync = promisify(fs.readFile)

module.exports = {
  isProd,
  basePath,
  baseUrl,
  assetPath,
  destDir,
  destBaseDir,
  destAssetDir,
  readFileAsync,
}
