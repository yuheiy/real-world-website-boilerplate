const path = require('path')
const gulp = require('gulp')
const { toPOSIXPath } = require('../lib/path')
const { destBaseDir, publicDir } = require('../config/path')

const copy = () => {
  return gulp
    .src(toPOSIXPath(path.join(publicDir, '**')), {
      dot: true,
      since: gulp.lastRun(copy),
    })
    .pipe(gulp.dest(destBaseDir))
}

module.exports = copy
