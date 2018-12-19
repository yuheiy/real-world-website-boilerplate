const gulp = require('gulp')
const clean = require('./clean')
const html = require('./html')
const css = require('./css')
const js = require('./js')
const copy = require('./copy')

const build = gulp.series(clean, gulp.parallel(html, css, js, copy))

module.exports = build
