const path = require('path')
const { readFile, writeFile } = require('fs')
const { promisify } = require('util')
const { origin, subdir } = require('../realworld.config')

const toPosixPath = (pathname) => {
  if (path.sep === path.posix.sep) {
    return pathname
  }

  return pathname.replace(
    new RegExp(`\\${path.win32.sep}`, 'g'),
    path.posix.sep,
  )
}

const isProd = process.argv[2] === 'build'

const basePath = path.join('/', subdir || '')
const assetPath = path.join(basePath, 'assets')
const baseUrl = `${origin}${subdir ? toPosixPath(basePath) : ''}`
const baseAssetUrl = `${origin}${toPosixPath(assetPath)}`

const destDir = isProd ? 'dist' : 'tmp'
const destBaseDir = path.join(destDir, basePath)
const destAssetDir = path.join(destDir, assetPath)

const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)

module.exports = {
  isProd,
  origin,
  basePath,
  assetPath,
  baseUrl,
  baseAssetUrl,
  destDir,
  destBaseDir,
  destAssetDir,
  readFileAsync,
  writeFileAsync,
  toPosixPath,
}
