const { dirname, join, relative } = require('path')
const { render } = require('node-sass')
const globImporter = require('node-sass-glob-importer')
const red = require('ansi-red')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const csswring = require('csswring')
const makeDir = require('make-dir')
const { isProd, destAssetDir, writeFileAsync } = require('./util')
const cssImporter = require('./cssImporter')

const destCssDir = join(destAssetDir, 'css')

const sassImporters = [cssImporter, globImporter()]

const postcssPlugins = [
  autoprefixer({
    cascade: false,
  }),
  ...(isProd ? [csswring()] : []),
]

const buildCss = async (entries) => {
  await Promise.all(
    Object.entries(entries).map(async ([name, srcPath]) => {
      const destFilename = `${name}.bundle.css`
      const destMapFilename = `${destFilename}.map`

      let sassResult
      try {
        sassResult = await new Promise((resolve, reject) => {
          render(
            {
              file: srcPath,
              importer: sassImporters,
              outFile: join(dirname(srcPath), destFilename),
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

      const postcssResult = await postcss(postcssPlugins).process(
        sassResult.css,
        {
          from: destFilename,
          to: destFilename,
          map: !isProd && { prev: JSON.parse(sassResult.map) },
        },
      )

      await makeDir(destCssDir)
      await Promise.all([
        writeFileAsync(join(destCssDir, destFilename), postcssResult.css),
        ...(postcssResult.map
          ? [
              writeFileAsync(
                join(destCssDir, destMapFilename),
                postcssResult.map,
              ),
            ]
          : []),
      ])
    }),
  )
}

module.exports = buildCss
