const gulp = require('gulp')
const bs = require('./browserSync/instance')
const clean = require('./clean')
const css = require('./css')
const js = require('./js')
const watch = require('./watch')
const serve = require('./serve')

const enableWatchMode = (done) => {
  css.enableWatchMode()
  js.enableWatchMode((hasErrors) => {
    if (hasErrors) {
      return
    }

    bs.reload('*.js')
  })
  done()
}

const start = gulp.series(
  clean,
  enableWatchMode,
  gulp.parallel(css, js),
  watch,
  serve,
)

module.exports = start
