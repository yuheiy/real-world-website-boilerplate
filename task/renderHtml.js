const { join, parse, relative, posix } = require('path')
const fg = require('fast-glob')
const replaceExt = require('replace-ext')
const { safeLoad: parseYaml } = require('js-yaml')
const yellow = require('ansi-yellow')
const { render: renderPug } = require('pug')
const {
  isProd,
  origin,
  basePath,
  assetPath,
  baseUrl,
  baseAssetUrl,
  readFileAsync,
} = require('./util')

const loaders = {
  '.yml': async (filePath) => parseYaml(await readFileAsync(filePath)),
  '.json': async (filePath) => JSON.parse(await readFileAsync(filePath)),
}

const configFileExts = Object.keys(loaders)

const createFileConfig = async () => {
  const filePaths = (await fg(
    configFileExts.map((ext) => `src/html/_data/*${ext}`),
  )).filter((filePath, idx, arr) => {
    const { name } = parse(filePath)
    const prevNames = arr.slice(0, idx).map((item) => parse(item).name)
    return !prevNames.includes(name)
  })
  const userConfigs = await Promise.all(
    filePaths.map(async (filePath) => {
      const { name, ext } = parse(filePath)
      return {
        name,
        config: await loaders[ext](filePath),
      }
    }),
  )
  const fileConfig = userConfigs.reduce(
    (acc, { name, config }) => ({
      ...acc,
      [name]: config,
    }),
    {},
  )
  return fileConfig
}

const createPageConfig = async (pageFilePath) => {
  const [filePath] = await fg(
    configFileExts.map((ext) => replaceExt(pageFilePath, ext)),
  )
  const userConfig = filePath
    ? await loaders[parse(filePath).ext](filePath)
    : {}
  const pagePath = posix
    .join('/', replaceExt(relative('src/html', pageFilePath), '.html'))
    .replace(/\/index\.html$/, '/')
  const pageConfig = {
    ...userConfig,
    path: pagePath,
  }
  return pageConfig
}

const baseOpts = {
  basedir: './src/html',
}

const baseLocals = {
  __DEV__: !isProd,
  origin,
  absPath: (pagePath = '') => posix.join(basePath, '/', pagePath),
  assetPath: (pagePath = '') => posix.join(assetPath, '/', pagePath),
  absUrl: (pagePath = '') =>
    `${baseUrl.replace(/\/$/, '')}${posix.join('/', pagePath)}`,
  assetUrl: (pagePath = '') => `${baseAssetUrl}${posix.join('/', pagePath)}`,
}

const createTemplateConfig = async (pageFilePath) => {
  return {
    ...baseOpts,
    filename: pageFilePath,

    // locals
    ...baseLocals,
    file: await createFileConfig(),
    page: await createPageConfig(pageFilePath),
  }
}

const renderError = (err) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Error: ${err.message}</title>
    <style>
      pre { overflow: auto }
    </style>
  </head>
  <body>
    <h1>Error: ${err.message}</h1>
    <pre><code>${err.stack}</code></pre>
  </body>
</html>
`
}

const renderHtml = async ({ src, filename }) => {
  const filePath = relative('src/html', replaceExt(filename, '.html'))
  const [preferredFilePath] = await fg([
    join('vendor-public', basePath, filePath),
    join('public', filePath),
  ])
  if (preferredFilePath) {
    console.error(
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
