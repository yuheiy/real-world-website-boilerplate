const { join } = require('path')
const gulp = require('gulp')
const rename = require('gulp-rename')
const gulpif = require('gulp-if')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const globImporter = require('node-sass-glob-importer')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const csswring = require('csswring')
const { isProd, destAssetDir } = require('./util')

const sassImporters = [globImporter()]

const postcssPlugins = [
  autoprefixer({
    cascade: false,
  }),
  isProd && csswring(),
].filter(Boolean)

const buildCss = (...srcArgs) => {
  return gulp
    .src(...srcArgs)
    .pipe(rename({ suffix: '.bundle' }))
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(sass({ importer: sassImporters }).on('error', sass.logError))
    .pipe(postcss(postcssPlugins))
    .pipe(gulpif(!isProd, sourcemaps.write('.')))
    .pipe(gulp.dest(join(destAssetDir, 'css')))
}

module.exports = buildCss
