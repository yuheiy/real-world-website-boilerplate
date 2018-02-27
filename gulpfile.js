const path = require('path')
const browserSync = require('browser-sync').create()
const gulp = require('gulp')
const renderHelper = require('real-world-website-render-helper')
const {
  isProd,
  basePath,
  destDir,
  destBaseDir,
  destAssetDir,
} = require('./task/util')
const renderHtml = require('./task/renderHtml')

const renderHelperConfig = {
  input: 'src/html',
  inputExt: 'pug',
  output: destBaseDir,
  outputExt: 'html',
  render: renderHtml,
}

const css = () => {
  const gulpif = require('gulp-if')
  const sourcemaps = require('gulp-sourcemaps')
  const sass = require('gulp-sass')
  const globImporter = require('node-sass-glob-importer')
  const postcss = require('gulp-postcss')
  const autoprefixer = require('autoprefixer')
  const csswring = require('csswring')

  return gulp
    .src('src/css/main.scss')
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(
      sass({
        importer: globImporter(),
      }).on('error', sass.logError),
    )
    .pipe(
      postcss([
        autoprefixer({
          cascade: false,
        }),
        ...(isProd ? [csswring()] : []),
      ]),
    )
    .pipe(gulpif(!isProd, sourcemaps.write('.')))
    .pipe(gulp.dest(path.join(destAssetDir, 'css')))
    .pipe(browserSync.stream({ match: '**/*.css' }))
}

const js = (done) => {
  const webpack = require('webpack')
  const config = require('./webpack.config')
  const compiler = webpack(config)
  let isFirst = true

  const callback = (err, stats) => {
    if (err) {
      console.error(err.stack || err)
      if (err.details) {
        console.error(err.details)
      }
      return
    }

    console.log(
      stats.toString({
        chunks: false,
        colors: true,
      }),
    )

    if (isFirst) {
      done()
      isFirst = false
      return
    }

    browserSync.reload()
  }

  if (isProd) {
    compiler.run(callback)
    return
  }

  compiler.watch({}, callback)
}

const serve = (done) => {
  browserSync.init(
    {
      notify: false,
      ui: false,
      server: {
        baseDir: [destDir, 'vendor-public'],
        routes: {
          [`${basePath || '/'}`]: 'public',
        },
      },
      middleware: renderHelper.createRenderMiddleware(
        renderHelperConfig,
        basePath,
      ),
      startPath: path.join(basePath, '/'),
      ghostMode: false,
      open: false,
    },
    done,
  )
}

const clean = () => {
  const del = require('del')
  return del(destDir)
}

const watch = (done) => {
  const options = {
    delay: 50,
  }

  const reload = (done) => {
    browserSync.reload()
    done()
  }

  gulp.watch('src/css/**/*.scss', options, css)
  gulp.watch(['src/html/**/*', 'public/**/*'], options, reload)
  done()
}

// prettier-ignore
gulp.task('default', gulp.series(
    clean,
    gulp.parallel(css, js),
    serve,
    watch,
))

const html = () => {
  return renderHelper.build(renderHelperConfig)
}

const copy = () => {
  return gulp.src('public/**/*').pipe(gulp.dest(destBaseDir))
}

// prettier-ignore
gulp.task('build', gulp.series(
    clean,
    gulp.parallel(html, css, js, copy),
))
