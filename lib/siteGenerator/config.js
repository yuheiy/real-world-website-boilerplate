const path = require('path')
const minimatch = require('minimatch')
const replaceExt = require('replace-ext')
const { toPOSIXPath } = require('../path')

const loadConfig = (opts = {}) => {
  const inputDir = opts.inputDir || 'src'
  const inputExt = opts.inputExt || '.html'
  const exclude = opts.exclude || ['**/_*', '**/_*/**']
  const outputDir = opts.outputDir || 'dist'
  const outputExt = opts.outputExt || '.html'
  const task = opts.task || ((stream, _handleError) => stream)
  const basePath = opts.basePath || '/'

  return {
    inputDir,
    inputExt,
    exclude,
    outputDir,
    outputExt,
    task,
    basePath,
    get vinylInput() {
      const inputPattern = toPOSIXPath(
        path.join(inputDir, '**', `*${inputExt}`),
      )
      const excludePatterns = exclude.map((pattern) => {
        return `!${pattern}`
      })
      return [inputPattern, ...excludePatterns]
    },
    isExcludes: (pathname) => {
      const inputPathFromInputDir = path.relative(inputDir, pathname)
      return exclude.some((pattern) => {
        return minimatch(inputPathFromInputDir, pattern)
      })
    },
    getInputPath: (outputPath) => {
      if (path.extname(outputPath) !== outputExt) {
        return null
      }

      const inputPathFromInputDir = replaceExt(outputPath, inputExt)
      const inputPath = path.join(inputDir, inputPathFromInputDir)
      return inputPath
    },
  }
}

const withConfig = (cb) => (opts) => {
  const config = loadConfig(opts)
  return cb(config)
}

module.exports = withConfig
