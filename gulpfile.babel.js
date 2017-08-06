const path = require('path')
const fs = require('fs')
const browserSync = require('browser-sync').create()
const gulp = require('gulp')
const plugins = require('gulp-load-plugins')()
const renderHtml = require('./task/renderHtml')
const siteConfig = require('./realworld.config')

const isProd = process.argv.includes('--prod')
const destDir = isProd ? 'dist' : 'tmp'
const destBaseDir = path.join(destDir, siteConfig.baseDir || '')
const destAssetsDir = path.join(destBaseDir, 'assets')

const css = () => {
  const globbing = require('node-sass-globbing')
  const autoprefixer = require('autoprefixer')
  const csswring = require('csswring')

  return gulp.src('src/css/main.scss')
    .pipe(plugins.if(!isProd, plugins.sourcemaps.init()))
    .pipe(plugins.sass({
      importer: globbing,
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
    const webpackConfig = require('./webpack.config.js')
    jsCompiler = webpack(webpackConfig)
  }

  jsCompiler.run((err, stats) => {
    if (err) throw new plugins.util.PluginError('webpack', err)
    plugins.util.log('[webpack]', stats.toString({
      colors: true,
    }))

    browserSync.reload()
    done()
  })
}

const renderHtmlMiddleware = (req, res, next) => {
  const baseDir = siteConfig.baseDir || ''
  const notCovered = !req.url.startsWith(`${baseDir}/`)
  const ignoreFileOrDir = req.url.replace(`${baseDir}/`, '').split('/').some(name => name.startsWith('_'))
  if (notCovered || ignoreFileOrDir) {
    return next()
  }

  const file = path.join(
    'src',
    'html',
    req.url.replace(baseDir, ''),
  )
  .replace(/\?.*/, '')
  .replace(/\/$/, '/index.html')
  .replace(/\.html$/, '.pug')
  if (!(fs.existsSync(file) && fs.statSync(file).isFile())) {
    return next()
  }

  const result = renderHtml(file)
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
        [`${siteConfig.baseDir || '/'}`]: 'public',
      },
    },
    middleware: renderHtmlMiddleware,
    startPath: path.posix.join('/', siteConfig.baseDir || '', '/'),
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
  }, (err, files) => {
    files.forEach(file => {
      const outputFile = file
      .replace(/^src\/html/, destBaseDir)
      .replace(/\.pug$/, '.html')
      const outputDir = path.dirname(outputFile)
      const result = renderHtml(file)
      makeDir.sync(outputDir)
      fs.writeFileSync(outputFile, result)
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
