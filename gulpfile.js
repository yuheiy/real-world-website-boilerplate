const { join } = require('path')
const gulp = require('gulp')
const { create: createbrowserSync } = require('browser-sync')
const {
  createRenderMiddleware,
  build: buildFiles,
} = require('real-world-website-render-helper')
const webpack = require('webpack')
const del = require('del')
const {
  isProd,
  basePath,
  destDir,
  destBaseDir,
  toPosixPath,
} = require('./task/util')
const buildCss = require('./task/buildCss')
const renderHtml = require('./task/renderHtml')
const webpackConfig = require('./webpack.config')

const bs = createbrowserSync()

const cssEntries = {
  main: 'src/css/main.scss',
}

const renderHelperConfig = {
  input: 'src/html',
  inputExt: 'pug',
  output: destBaseDir,
  outputExt: 'html',
  render: renderHtml,
}

const css = async () => {
  await buildCss(cssEntries)
  bs.reload('*.css')
}

const js = (done) => {
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

    bs.reload('*.js')
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
        baseDir: ['vendor-public', destDir],
        routes: {
          [basePath]: 'public',
        },
      },
      middleware: createRenderMiddleware(renderHelperConfig, basePath),
      startPath: toPosixPath(join(basePath, '/')),
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
  return gulp.src('public/**/*', { dot: true }).pipe(gulp.dest(destBaseDir))
}

// prettier-ignore
gulp.task('build', gulp.series(
  clean,
  gulp.parallel(html, css, js, copy),
))
