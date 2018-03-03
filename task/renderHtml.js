const { join, parse } = require('path')
const fg = require('fast-glob')
const replaceExt = require('replace-ext')
const { safeLoad: parseYaml } = require('js-yaml')
const { render: renderPug } = require('pug')
const {
  isProd,
  basePath,
  assetPath,
  baseUrl,
  readFileAsync,
} = require('./util')

const loaders = {
  '.json': (data) => JSON.parse(data),
  '.yml': (data) => parseYaml(data),
}

const dataFileExts = Object.keys(loaders)

const readFileData = async () => {
  const filePaths = (await fg(
    dataFileExts.map((ext) => `src/html/_data/*${ext}`),
  )).filter((filePath, idx, arr) => {
    const { name } = parse(filePath)
    const prevNames = arr.slice(0, idx).map((item) => parse(item).name)
    return !prevNames.includes(name)
  })
  const fileData = await Promise.all(
    filePaths.map(async (filePath) => ({
      name: parse(filePath).name,
      data: loaders[parse(filePath).ext](await readFileAsync(filePath, 'utf8')),
    })),
  )
  const gatheredFileData = fileData.reduce(
    (acc, { name, data }) => ({
      ...acc,
      [name]: data,
    }),
    {},
  )
  return gatheredFileData
}

const readPageData = async (pageFilePath) => {
  const [filePath] = await fg(
    dataFileExts.map((ext) => replaceExt(pageFilePath, ext)),
  )
  const fileData = filePath
    ? loaders[parse(filePath).ext](await readFileAsync(filePath, 'utf8'))
    : {}
  const pagePath = replaceExt(
    pageFilePath.replace('src/html', ''),
    '.html',
  ).replace(/\/index\.html$/, '/')
  const pageData = {
    ...fileData,
    path: pagePath,
  }
  return pageData
}

const baseOpts = {
  basedir: './src/html',
}
const baseLocals = {
  __DEV__: !isProd,
  absPath: (pagePath) => join(basePath, pagePath),
  assetPath: (pagePath) => join(assetPath, pagePath),
  absUrl: (pagePath) => `${baseUrl}${join('/', pagePath)}`,
}

const createTemplateConfig = async (pageFilePath) => {
  return {
    ...baseOpts,
    filename: pageFilePath,

    // locals
    ...baseLocals,
    file: await readFileData(),
    page: await readPageData(pageFilePath),
  }
}

const renderError = (err) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Error: ${err.msg}</title>
    <style>
      pre { overflow: auto }
    </style>
  </head>
  <body>
    <h1>Error: ${err.msg}</h1>
    <pre><code>${err.stack}</code></pre>
  </body>
</html>
`
}

const renderHtml = async ({ src, filename }) => {
  try {
    const config = await createTemplateConfig(filename)
    return renderPug(src.toString(), config)
  } catch (err) {
    if (isProd) {
      throw err
    }

    console.error(err.stack)
    return renderError(err)
  }
}

module.exports = renderHtml
