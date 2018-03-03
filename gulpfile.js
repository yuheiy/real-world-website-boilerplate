const { join } = require('path')
const { create: createbrowserSync } = require('browser-sync')
const {
  createRenderMiddleware,
  build: buildFiles,
} = require('real-world-website-render-helper')
const gulp = require('gulp')
const gulpif = require('gulp-if')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const globImporter = require('node-sass-glob-importer')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const csswring = require('csswring')
const webpack = require('webpack')
const del = require('del')
const {
  isProd,
  basePath,
  destDir,
  destBaseDir,
  destAssetDir,
} = require('./task/util')
const renderHtml = require('./task/renderHtml')
const webpackConfig = require('./webpack.config')

const bs = createbrowserSync()

const renderHelperConfig = {
  input: 'src/html',
  inputExt: 'pug',
  output: destBaseDir,
  outputExt: 'html',
  render: renderHtml,
}

const css = () => {
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
    .pipe(gulp.dest(join(destAssetDir, 'css')))
    .pipe(bs.stream({ match: '**/*.css' }))
}

const js = (done) => {
  const compiler = webpack(webpackConfig)
  let isFirst = true

  const callback = (err, stats) => {
    if (err) {
      console.log(err.stack || err)
      if (err.details) {
        console.log(err.details)
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

    bs.reload()
  }

  if (isProd) {
    compiler.run(callback)
    return
  }

  compiler.watch({}, callback)
}

const serve = (done) => {
  bs.init(
    {
      notify: false,
      ui: false,
      server: {
        baseDir: [destDir, 'root-public'],
        routes: {
          [basePath]: 'public',
        },
      },
      middleware: createRenderMiddleware(renderHelperConfig, basePath),
      startPath: join(basePath, '/'),
      ghostMode: false,
      open: false,
    },
    done,
  )
}

const clean = () => {
  return del(destDir)
}

const watch = (done) => {
  const options = {
    delay: 50,
  }

  const reload = (done) => {
    bs.reload()
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
  return buildFiles(renderHelperConfig)
}

const copy = () => {
  return gulp.src('public/**/*').pipe(gulp.dest(destBaseDir))
}

// prettier-ignore
gulp.task('build', gulp.series(
  clean,
  gulp.parallel(html, css, js, copy),
))
