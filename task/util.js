const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const { origin, subdir } = require('../realworld.config')

const isProd = process.argv[2] === 'build'

const basePath = path.join('/', subdir || '')
const assetPath = path.join(basePath, 'assets')
const baseUrl = `${origin}${basePath}`

const destDir = isProd ? 'dist' : 'tmp'
const destBaseDir = path.join(destDir, basePath)
const destAssetDir = path.join(destDir, assetPath)

const readFileAsync = promisify(fs.readFile)

module.exports = {
  isProd,
  basePath,
  assetPath,
  baseUrl,
  destDir,
  destBaseDir,
  destAssetDir,
  readFileAsync,
}
