const path = require('path')
const { toPOSIXPath } = require('../lib/path')
const { buildCompileMiddleware } = require('../lib/siteGenerator')
const {
  basePath,
  destDir,
  publicDir,
  vendorPublicDir,
} = require('../config/path')
const siteGeneratorConfig = require('../config/siteGenerator')
const bs = require('./browserSync/instance')

const compileHtmlMiddleware = buildCompileMiddleware(siteGeneratorConfig)

const serve = (done) => {
  bs.init(
    {
      notify: false,
      ui: false,
      server: {
        baseDir: [vendorPublicDir, destDir],
        routes: {
          [toPOSIXPath(path.join('/', basePath))]: publicDir,
        },
      },
      middleware: [compileHtmlMiddleware],
      startPath: toPOSIXPath(path.join('/', basePath, '/')),
      ghostMode: false,
      open: false,
    },
    done,
  )
}

module.exports = serve
