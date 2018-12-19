const path = require('path')
const parseArgs = require('minimist')
const { isDev } = require('./flag')

const argv = parseArgs(process.argv.slice(2))

const basePath = argv.subdir || ''
const assetsPath = path.join(basePath, 'assets')

const destDir = isDev ? '.tmp' : 'dist'
const destBaseDir = path.join(destDir, basePath)
const destAssetsDir = path.join(destDir, assetsPath)

const publicDir = 'public'
const vendorPublicDir = 'vendor-public'

module.exports = {
  basePath,
  assetsPath,
  destDir,
  destBaseDir,
  destAssetsDir,
  publicDir,
  vendorPublicDir,
}
