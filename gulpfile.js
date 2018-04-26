const { join, relative } = require('path')
const gulp = require('gulp')
const { create: createbrowserSync } = require('browser-sync')
const {
  createRenderMiddleware,
  build: buildFiles,
} = require('real-world-website-render-helper')
const { render: renderSass } = require('node-sass')
const globImporter = require('node-sass-glob-importer')
const red = require('ansi-red')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const csswring = require('csswring')
const makeDir = require('make-dir')
const webpack = require('webpack')
const del = require('del')
const {
  isProd,
  basePath,
  assetPath,
  destDir,
  destBaseDir,
  destAssetDir,
  writeFileAsync,
  toPosixPath,
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

const css = async () => {
  let sassResult
  try {
    sassResult = await new Promise((resolve, reject) => {
      renderSass(
        {
          file: 'src/css/main.scss',
          importer: globImporter(),
          outFile: 'src/css/main.bundle.css',
          sourceMap: !isProd,
          sourceMapContents: true,
        },
        (err, result) => {
          if (err) {
            reject(err)
            return
          }
          resolve(result)
        },
      )
    })
  } catch (err) {
    const filePath = relative(__dirname, err.file)
    console.error(red(`Error in ${filePath}`))
    console.error(err.formatted.toString())
    return
  }

  const postcssResult = await postcss([
    autoprefixer({
      cascade: false,
    }),
    ...(isProd ? [csswring()] : []),
  ]).process(sassResult.css, {
    from: 'main.bundle.css',
    to: 'main.bundle.css',
    map: !isProd && { prev: JSON.parse(sassResult.map) },
  })

  await makeDir(join(destAssetDir, 'css'))
  await Promise.all([
    writeFileAsync(
      join(destAssetDir, 'css/main.bundle.css'),
      postcssResult.css,
    ),
    ...(postcssResult.map
      ? [
          writeFileAsync(
            join(destAssetDir, 'css/main.bundle.css.map'),
            postcssResult.map,
          ),
        ]
      : []),
  ])

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
  return gulp.src('public/**/*').pipe(gulp.dest(destBaseDir))
}

// prettier-ignore
gulp.task('build', gulp.series(
  clean,
  gulp.parallel(html, css, js, copy),
))
