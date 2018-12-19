const webpack = require('webpack')
const webpackConfig = require('../config/webpack.config')

let isWatchMode = false
let watchCallback = null

const js = (done) => {
  const compiler = webpack(webpackConfig)
  let isFirst = true

  const callback = (err, stats) => {
    if (err) {
      throw err
    }

    console.log(
      stats.toString({
        colors: true,
        modules: false,
        version: false,
      }),
    )

    if (stats.hasErrors()) {
      if (!isWatchMode) {
        done(new Error('webpack compilation errors'))
        return
      }
    }

    if (isFirst) {
      done()
      isFirst = false
      return
    }

    if (watchCallback) {
      watchCallback(stats.hasErrors())
    }
  }

  if (isWatchMode) {
    compiler.watch({}, callback)
  } else {
    compiler.run(callback)
  }
}

js.enableWatchMode = (callback) => {
  isWatchMode = true
  watchCallback = callback
}

module.exports = js
