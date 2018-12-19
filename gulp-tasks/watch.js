const gulp = require('gulp')
const { publicDir, vendorPublicDir } = require('../config/path')
const bs = require('./browserSync/instance')
const css = require('./css')

const makeReload = (...args) => {
  return function reload(done) {
    bs.reload(...args)
    done()
  }
}

const opts = {
  delay: 0,
}

const watch = (done) => {
  gulp.watch(['src/html', publicDir, vendorPublicDir], makeReload(), opts)
  gulp.watch('src/css', gulp.series(css, makeReload('*.css')), opts)
  done()
}

module.exports = watch
