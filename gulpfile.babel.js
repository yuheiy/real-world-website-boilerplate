const path = require('path')
const fs = require('fs')
const browserSync = require('browser-sync').create()
const gulp = require('gulp')
const plugins = require('gulp-load-plugins')()
const renderHtml = require('./task/renderHtml')
const { isProd, basePath, destDir, destBaseDir, destAssetsDir } = require('./task/util')

const {
  renderMiddleware: renderHtmlMiddleware,
  buildAllFiles: html,
} = require('real-world-website-render-helper')(
  {
    input: './src/html',
    inputExt: 'pug',
    output: destBaseDir,
    task: renderHtml,
  },
  basePath,
)

const css = () => {
  const globImporter = require('node-sass-glob-importer')
  const autoprefixer = require('autoprefixer')
  const csswring = require('csswring')

  return gulp
    .src('src/css/main.scss')
    .pipe(plugins.if(!isProd, plugins.sourcemaps.init()))
    .pipe(
      plugins
        .sass({
          importer: globImporter(),
        })
        .on('error', plugins.sass.logError),
    )
    .pipe(
      plugins.postcss([
        autoprefixer({
          cascade: false,
        }),
        ...(isProd ? [csswring()] : []),
      ]),
    )
    .pipe(plugins.if(!isProd, plugins.sourcemaps.write('.')))
    .pipe(gulp.dest(path.join(destAssetsDir, 'css')))
    .pipe(browserSync.stream({ match: '**/*.css' }))
}

const js = (done) => {
  const webpack = require('webpack')
  const webpackConfig = require('./webpack.config')
  const compiler = webpack(webpackConfig)
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
    return compiler.run(callback)
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
      middleware: renderHtmlMiddleware,
      startPath: path.posix.join('/', basePath, '/'),
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
  gulp.watch('src/css/**/*.scss', css)
  gulp.watch(['src/html/**/*', 'public/**/*']).on('all', browserSync.reload)
  done()
}

export default gulp.series(clean, gulp.parallel(css, js), serve, watch)

const copy = () => {
  return gulp.src('public/**/*').pipe(gulp.dest(destBaseDir))
}

export const build = gulp.series(clean, gulp.parallel(html, css, js, copy))
