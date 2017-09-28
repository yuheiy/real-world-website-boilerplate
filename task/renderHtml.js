const path = require('path')
const fs = require('fs')
const glob = require('glob')
const pug = require('pug')
const siteConfig = require('../realworld.config')

const isProd = process.argv.includes('--prod')

const getFileData = () => {
  const files = glob.sync('src/html/_data/*.json', {nodir: true})
  const data = files
    .map((file) => ({
      name: path.basename(file, '.json'),
      data: JSON.parse(fs.readFileSync(file, 'utf8') || '{}'),
    }))
    .reduce((result, {name, data}) => ({
      ...result,
      [name]: data,
    }), {})
  return data
}

const getPageData = (templateFile) => {
  const [file] = glob.sync(templateFile.replace(/\.pug$/, '.json'), {nodir: true})
  const data = file
    ? JSON.parse(fs.readFileSync(file) || '{}')
    : {}
  const pagePath = templateFile
    .replace(/^src\/html/, '')
    .replace(/\.pug$/, '.html')
    .replace(/\/index\.html$/, '/')
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

const getTemplateConfig = (pageFile) => {
  return {
    ...pugConfig,

    // locals
    ...baseLocals,
    file: getFileData(),
    page: getPageData(pageFile),
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

const renderHtml = (file) => {
  try {
    return pug.renderFile(file, getTemplateConfig(file))
  } catch (err) {
    console.log(err.stack)
    return renderError(err)
  }
}

module.exports = renderHtml
