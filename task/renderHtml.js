const path = require('path')
const fs = require('fs')
const {promisify} = require('util')
const glob = require('glob')
const yaml = require('js-yaml')
const pug = require('pug')
const siteConfig = require('../realworld.config')

const readFileAsync = promisify(fs.readFile)

const isProd = process.argv.includes('--prod')

const readFileData = async () => {
  const filePaths = await new Promise((resolve) => {
    glob('src/html/_data/*.yml', {nodir: true}, (err, filePaths) => {
      resolve(filePaths)
    })
  })
  const fileData = await Promise.all(
    filePaths
      .map(async (filePath) => ({
        name: path.basename(filePath, '.yml'),
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

const readPageData = async (templateFilePath) => {
  const [filePath] = await new Promise((resolve) => {
    glob(templateFilePath.replace(/\.pug$/, '.yml'), {nodir: true}, (err, filePaths) => {
      resolve(filePaths)
    })
  })
  const fileData = filePath
    ? yaml.safeLoad(await readFileAsync(filePath))
    : {}
  const pagePath = templateFilePath
    .replace(/^src\/html/, '')
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
