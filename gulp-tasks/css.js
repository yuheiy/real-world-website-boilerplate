const gulp = require('gulp')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const globImporter = require('node-sass-glob-importer')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const gapProperties = require('postcss-gap-properties')
const csswring = require('csswring')
const { isDev } = require('../config/flag')
const { destAssetsDir } = require('../config/path')

const sassImporters = [globImporter()]

const postcssPlugins = [
  autoprefixer({
    cascade: false,
    grid: 'autoplace',
  }),
  gapProperties({ preserve: false }),
  !isDev && csswring(),
].filter(Boolean)

let isWatchMode = false

const css = () => {
  const sassStream = sass({ importer: sassImporters })

  if (isWatchMode) {
    sassStream.on('error', sass.logError)
  }

  return gulp
    .src(['src/css/*.scss', '!src/css/_*.scss'], { sourcemaps: isDev })
    .pipe(rename({ suffix: '.bundle' }))
    .pipe(sassStream)
    .pipe(postcss(postcssPlugins))
    .pipe(gulp.dest(destAssetsDir, { sourcemaps: isDev && '.' }))
}

css.enableWatchMode = () => {
  isWatchMode = true
}

module.exports = css
