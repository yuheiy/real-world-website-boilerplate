const path = require('path')
const fs = require('fs')
const browserSync = require('browser-sync').create()
const gulp = require('gulp')
const plugins = require('gulp-load-plugins')()
const renderHtml = require('./task/renderHtml')
const {isProd, basePath, destDir, destBaseDir, destAssetsDir, writeFileAsync} = require('./task/util')

const css = () => {
  const globImporter = require('node-sass-glob-importer')
  const autoprefixer = require('autoprefixer')
  const csswring = require('csswring')

  return gulp.src('src/css/main.scss')
    .pipe(plugins.if(!isProd, plugins.sourcemaps.init()))
    .pipe(plugins.sass({
      importer: globImporter(),
    }).on('error', plugins.sass.logError))
    .pipe(plugins.postcss([
      autoprefixer({
        cascade: false,
      }),
      ...(isProd ? [
        csswring(),
      ] : []),
    ]))
    .pipe(plugins.if(!isProd, plugins.sourcemaps.write('.')))
    .pipe(gulp.dest(path.join(destAssetsDir, 'css')))
    .pipe(browserSync.stream({match: '**/*.css'}))
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

    console.log(stats.toString({
      chunks: false,
      colors: true,
    }))

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

const renderHtmlMiddleware = (req, res, next) => {
  const url = require('url')
  const {pathname} = url.parse(req.url)
  const isInternal = pathname.startsWith(`${basePath}/`)
  const isStartsWithUnderscore = pathname.replace(`${basePath}/`, '').split('/')
    .some((name) => name.startsWith('_'))
  const isHtml = pathname.replace(basePath, '')
    .replace(/\/$/, '/index.html') // replace `/` to `/index.html`
    .endsWith('.html')
  const isIgnoreFile = !isInternal || isStartsWithUnderscore || !isHtml
  if (isIgnoreFile) {
    return next()
  }

  const filePath = path.join(
    'src',
    'html',
    pathname.replace(basePath, '')
      .replace(/\/$/, '/index.html') // replace `/` to `/index.html`
      .replace(/\.html$/, '.pug')
  )
  const isFileExists = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
  if (!isFileExists) {
    return next()
  }

  renderHtml(filePath)
    .then((result) => {
      res.setHeader('Content-Type', 'text/html')
      res.end(result)
    })
}

const serve = (done) => {
  browserSync.init({
    notify: false,
    ui: false,
    server: {
      baseDir: [
        destDir,
        'vendor-public',
      ],
      routes: {
        [`${basePath || '/'}`]: 'public',
      },
    },
    middleware: renderHtmlMiddleware,
    startPath: path.posix.join('/', basePath, '/'),
    ghostMode: false,
    open: false,
  }, done)
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

export default gulp.series(
  clean,
  gulp.parallel(css, js),
  serve,
  watch,
)

const html = async () => {
  const globby = require('globby')
  const makeDir = require('make-dir')

  const filePaths = await globby('src/html/**/*.pug', {
    nodir: true,
    ignore: [
      'src/html/**/_*',
      'src/html/**/_*/**',
    ],
  })

  await Promise.all(
    filePaths
      .map(async (filePath) => {
        const outputFilePath = filePath
          .replace('src/html', destBaseDir)
          .replace(/\.pug$/, '.html')
        const outputDir = path.dirname(outputFilePath)
        await makeDir(outputDir)
        const result = await renderHtml(filePath)
        await writeFileAsync(outputFilePath, result)
      })
  )
}

const copy = () => {
  return gulp.src('public/**/*')
    .pipe(gulp.dest(destBaseDir))
}

export const build = gulp.series(
  clean,
  gulp.parallel(html, css, js, copy),
)
