const { join, parse, relative } = require('path')
const fg = require('fast-glob')
const replaceExt = require('replace-ext')
const { safeLoad: parseYaml } = require('js-yaml')
const yellow = require('ansi-yellow')
const { render: renderPug } = require('pug')
const {
  isProd,
  basePath,
  assetPath,
  baseUrl,
  readFileAsync,
} = require('./util')

const loaders = {
  '.json': JSON.parse,
  '.yml': parseYaml,
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
  const dataObjs = await Promise.all(
    filePaths.map(async (filePath) => {
      const { name, ext } = parse(filePath)
      return {
        name,
        data: loaders[ext](await readFileAsync(filePath)),
      }
    }),
  )
  const fileData = dataObjs.reduce(
    (acc, { name, data }) => ({
      ...acc,
      [name]: data,
    }),
    {},
  )
  return fileData
}

const readPageData = async (pageFilePath) => {
  const [filePath] = await fg(
    dataFileExts.map((ext) => replaceExt(pageFilePath, ext)),
  )
  const dataObj = filePath
    ? loaders[parse(filePath).ext](await readFileAsync(filePath))
    : {}
  const pagePath = join(
    '/',
    replaceExt(relative('src/html', pageFilePath), '.html'),
  ).replace(/\/index\.html$/, '/')
  const pageData = {
    ...dataObj,
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
  const filePath = relative('src/html', replaceExt(filename, '.html'))
  const [preferredFilePath] = await fg([
    join('root-public', basePath, filePath),
    join('public', filePath),
  ])
  if (preferredFilePath) {
    console.log(
      yellow(
        `Warning: renderHtml() prefers \`${preferredFilePath}\` over \`${filename}\``,
      ),
    )
    return readFileAsync(preferredFilePath)
  }

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
