const { join } = require('path')
const { readFile } = require('fs')
const { promisify } = require('util')
const { origin, subdir } = require('../realworld.config')

const isProd = process.argv[2] === 'build'

const basePath = join('/', subdir || '')
const assetPath = join(basePath, 'assets')
const baseUrl = `${origin}${basePath}`

const destDir = isProd ? 'dist' : 'tmp'
const destBaseDir = join(destDir, basePath)
const destAssetDir = join(destDir, assetPath)

const readFileAsync = promisify(readFile)

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
