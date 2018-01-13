const path = require('path')
const fs = require('fs')
const browserSync = require('browser-sync').create()
const gulp = require('gulp')
const renderHelper = require('real-world-website-render-helper')
const renderHtml = require('./task/renderHtml')
const { isProd, basePath, destDir, destBaseDir, destAssetsDir } = require('./task/util')

const renderHelperConfig = {
    input: 'src/html',
    inputExt: 'pug',
    output: destBaseDir,
    outputExt: 'html',
    task: renderHtml,
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
            middleware: renderHelper.createRenderMiddleware(renderHelperConfig, basePath),
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
