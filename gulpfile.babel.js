const path = require('path')
const fs = require('fs')
const browserSync = require('browser-sync').create()
const gulp = require('gulp')
const plugins = require('gulp-load-plugins')()
const renderHtml = require('./task/renderHtml')
const siteConfig = require('./realworld.config')

const isProd = process.argv.includes('--prod')
const destDir = isProd ? 'dist' : 'tmp'
const destBaseDir = path.join(destDir, siteConfig.basePath || '')
const destAssetsDir = path.join(destBaseDir, 'assets')

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

let jsCompiler
const js = (done) => {
  if (!jsCompiler) {
    const webpack = require('webpack')
    const webpackConfig = require('./webpack.config')
    jsCompiler = webpack(webpackConfig({production: isProd}))
  }

  jsCompiler.run((err, stats) => {
    if (err) {
      throw new plugins.util.PluginError('webpack', err)
    }
    plugins.util.log('[webpack]', stats.toString())

    browserSync.reload()
    done()
  })
}

const renderHtmlMiddleware = (req, res, next) => {
  const basePath = siteConfig.basePath || ''
  const isInternal = req.url.startsWith(`${basePath}/`)
  const isIgnoreFileOrDir = req.url.replace(`${basePath}/`, '').split('/').some(name => name.startsWith('_'))
  if (!isInternal || isIgnoreFileOrDir) {
    return next()
  }

  const baseFilePath = path.join('src', 'html', req.url.replace(basePath, ''))
    .replace(/\?.*/, '') // remove search params
    .replace(/\/$/, '/index.html') // replace `/` to `/index.html`
  const fileDir = path.dirname(baseFilePath)
  const fileName = `${path.basename(baseFilePath, '.html')}.pug`
  const filePath = path.join(fileDir, fileName)
  if (!(fs.existsSync(filePath) && fs.statSync(filePath).isFile())) {
    return next()
  }

  const result = renderHtml(filePath)
  res.setHeader('Content-Type', 'text/html')
  res.end(result)
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
        [`${siteConfig.basePath || '/'}`]: 'public',
      },
    },
    middleware: renderHtmlMiddleware,
    startPath: path.posix.join('/', siteConfig.basePath || '', '/'),
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
  gulp.watch('src/js/**/*.js', js)

  gulp.watch('src/html/**/*').on('all', browserSync.reload)
  gulp.watch('public/**/*').on('all', browserSync.reload)

  done()
}

export default gulp.series(
  clean,
  gulp.parallel(css, js),
  serve,
  watch,
)

const html = (done) => {
  const glob = require('glob')
  const makeDir = require('make-dir')

  glob('src/html/**/*.pug', {
    nodir: true,
    ignore: [
      'src/html/**/_*',
      'src/html/**/_*/**',
    ],
  }, (err, filePaths) => {
    filePaths.forEach(filePath => {
      const baseOutputFilePath = filePath.replace(/^src\/html/, destBaseDir)
      const outputDir = path.dirname(baseOutputFilePath)
      const fileName = `${path.basename(baseOutputFilePath, '.pug')}.html`
      const outputFilePath = path.join(outputDir, fileName)
      const result = renderHtml(filePath)
      makeDir.sync(outputDir)
      fs.writeFileSync(outputFilePath, result)
    })

    done()
  })
}

const copy = () => {
  return gulp.src('public/**/*')
    .pipe(gulp.dest(destBaseDir))
}

export const build = gulp.series(
  clean,
  gulp.parallel(html, css, js, copy),
)
