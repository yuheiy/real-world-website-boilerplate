const path = require('path')
const fs = require('fs')
const URL = require('url').URL
const PluginError = require('plugin-error')
const mime = require('mime')
const through = require('through2')
const gulp = require('gulp')
const { toPOSIXPath } = require('../path')
const withConfig = require('./config')

const isDirectoryPath = (pathname) => {
  return pathname.endsWith('/')
}

const normalizePath = (pathname) => {
  if (isDirectoryPath(pathname)) {
    return toPOSIXPath(path.join(pathname, 'index.html'))
  }
  return pathname
}

const resolveBase = (base, target) => {
  const loop = (basePaths, targetPaths) => {
    const baseHead = basePaths[0]
    if (!baseHead) {
      return toPOSIXPath(path.join('/', ...targetPaths))
    }

    const targetHead = targetPaths[0]
    if (baseHead !== targetHead) {
      return null
    }

    return loop(basePaths.slice(1), targetPaths.slice(1))
  }

  const basePaths = base.split('/').filter((item) => item !== '')
  const targetPaths = target.split('/').filter((item) => item !== '')
  return loop(basePaths, targetPaths)
}

const escapeHtml = (str) => {
  if (str == null) {
    return ''
  }

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const wrapErrorWithHtml = (err) => {
  const escapedName = escapeHtml(err.name)
  const escapedMessage = escapeHtml(err.message)

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapedName} in plugin ${err.plugin}</title>
    <style>
      html { word-wrap: break-word; overflow-wrap: break-word }
      pre, code, samp { font-family: "Menlo", "Consolas", monospace }
      pre { overflow: auto }
    </style>
  </head>
  <body>
    <h1><code>${escapedName}</code> in plugin <code>${err.plugin}</code></h1>
    <pre><samp>${escapedMessage}</samp></pre>
  </body>
</html>
`
}

const buildCompileMiddleware = withConfig((config) => {
  const transform = (req, res, next) => {
    const parsedPath = new URL(req.url, 'http://example.com').pathname
    const requestedPath = normalizePath(parsedPath)

    const outputPath = resolveBase(config.basePath, requestedPath)
    if (!outputPath) {
      next()
      return
    }

    const inputPath = config.getInputPath(outputPath)
    if (!inputPath) {
      next()
      return
    }

    if (!fs.existsSync(inputPath)) {
      next()
      return
    }

    if (config.isExcludes(inputPath)) {
      next()
      return
    }

    const responseError = (err) => {
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/html')
      res.end(wrapErrorWithHtml(err))
    }

    const handleError = (err) => {
      console.error(String(err))
      responseError(err)
    }

    const responseFile = through.obj((file, _enc, cb) => {
      if (file.isNull()) {
        const err = new PluginError(
          'responseFile',
          new TypeError('file is not nullable'),
        )
        cb(err)
        return
      }

      if (file.isStream()) {
        const err = new PluginError(
          'responseFile',
          new TypeError('Streaming not supported'),
        )
        cb(err)
        return
      }

      res.setHeader('Content-Type', mime.getType(outputPath))
      res.end(file.contents)
      cb(null)
    })

    config
      .task(gulp.src(inputPath), handleError)
      .pipe(responseFile)
      .on('error', handleError)
  }

  return transform
})

module.exports = buildCompileMiddleware
