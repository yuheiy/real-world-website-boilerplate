const path = require('path')
const fs = require('fs')
const {promisify} = require('util')
const globby = require('globby')
const yaml = require('js-yaml')
const pug = require('pug')
const siteConfig = require('../realworld.config')

const readFileAsync = promisify(fs.readFile)

const isProd = process.argv[2] === 'build'

const dataFileExts = [
  '.yml',
  '.yaml',
  '.json',
]

const readFileData = async () => {
  const filePaths = (await globby(dataFileExts.map((ext) => `src/html/_data/*${ext}`), {nodir: true}))
    .filter((filePath, i, arr) => {
      const {name} = path.parse(filePath)
      const prevNames = arr.slice(0, i).map((item) => path.parse(item).name)
      return !prevNames.includes(name)
    })
  const fileData = await Promise.all(
    filePaths
      .map(async (filePath) => ({
        name: path.parse(filePath).name,
        data: yaml.safeLoad(await readFileAsync(filePath, 'utf8'))
      }))
  )
  const gatheredFileData = fileData
    .reduce((result, {name, data}) => ({
      ...result,
      [name]: data,
    }), {})
  return gatheredFileData
}

const readPageData = async (pageFilePath) => {
  const [filePath] = await globby(dataFileExts.map((ext) => pageFilePath.replace(/\.pug$/, ext)), {nodir: true})
  const fileData = filePath
    ? yaml.safeLoad(await readFileAsync(filePath))
    : {}
  const pagePath = pageFilePath
    .replace('src/html', '')
    .replace(/\.pug$/, '.html')
    .replace(/\/index\.html$/, '/') // replace `/index.html` to `/`
  const pageData = {
    ...fileData,
    path: pagePath,
  }
  return pageData
}

const pugConfig = {
  basedir: './src/html',
}
const baseLocals = {
  isProd,
  absPath: (pagePath) => path.posix.join(`${siteConfig.basePath || ''}/`, pagePath),
  assetPath: (pagePath) => path.posix.join(`${siteConfig.basePath || ''}/`, 'assets', pagePath),
  absUrl: (pagePath) => `${siteConfig.baseUrl}${path.posix.join('/', pagePath)}`,
}

const createTemplateConfig = async (pageFilePath) => {
  return {
    ...pugConfig,

    // locals
    ...baseLocals,
    file: await readFileData(),
    page: await readPageData(pageFilePath),
  }
}

const renderError = (err) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${err.msg}</title>
  </head>
  <body>
    <pre><code>${err.stack}</code></pre>
  </body>
</html>`
}

const renderHtml = async (filePath) => {
  try {
    const config = await createTemplateConfig(filePath)
    return pug.renderFile(filePath, config)
  } catch (err) {
    console.log(err.stack)
    return renderError(err)
  }
}

module.exports = renderHtml
