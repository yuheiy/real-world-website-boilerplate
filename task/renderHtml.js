const path = require('path')
const fs = require('fs')
const glob = require('glob')
const yaml = require('js-yaml')
const pug = require('pug')
const siteConfig = require('../realworld.config')

const isProd = process.argv.includes('--prod')

const getFileData = () => {
  const filePaths = glob.sync('src/html/_data/*.yml', {nodir: true})
  const data = filePaths
    .map((filePath) => ({
      name: path.basename(filePath, '.yml'),
      data: yaml.safeLoad(fs.readFileSync(filePath, 'utf8')),
    }))
    .reduce((result, {name, data}) => ({
      ...result,
      [name]: data,
    }), {})
  return data
}

const getPageData = (templateFilePath) => {
  const [filePath] = glob.sync(templateFilePath.replace(/\.pug$/, '.yml'), {nodir: true})
  const data = filePath
    ? yaml.safeLoad(fs.readFileSync(filePath))
    : {}
  const basePagePath = templateFilePath.replace(/^src\/html/, '')
  const pageDir = path.dirname(basePagePath)
  const pageFileName = `${path.basename(basePagePath, '.pug')}.html`
  const pagePath = path.join(pageDir, pageFileName).replace(/\/index\.html$/, '/')
  return {
    ...data,
    path: pagePath,
  }
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

const getTemplateConfig = (pageFilePath) => {
  return {
    ...pugConfig,

    // locals
    ...baseLocals,
    file: getFileData(),
    page: getPageData(pageFilePath),
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

const renderHtml = (filePath) => {
  try {
    return pug.renderFile(filePath, getTemplateConfig(filePath))
  } catch (err) {
    console.log(err.stack)
    return renderError(err)
  }
}

module.exports = renderHtml
