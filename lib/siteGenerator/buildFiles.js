const gulp = require('gulp')
const withConfig = require('./config')

const logError = (err) => {
  console.error(String(err))
}

const buildFiles = withConfig((config) => {
  return config
    .task(gulp.src(config.vinylInput), logError)
    .pipe(gulp.dest(config.outputDir))
})

module.exports = buildFiles
