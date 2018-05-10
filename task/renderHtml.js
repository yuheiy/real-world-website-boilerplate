const { join, parse, relative, normalize } = require('path')
const uniqWith = require('lodash.uniqwith')
const fg = require('fast-glob')
const replaceExt = require('replace-ext')
const { safeLoad } = require('js-yaml')
const yellow = require('ansi-yellow')
const { render } = require('pug')
const {
  isProd,
  origin,
  basePath,
  assetPath,
  baseUrl,
  baseAssetUrl,
  readFileAsync,
  toPosixPath,
} = require('./util')

const loaders = {
  '.yml': async (filePath) => safeLoad(await readFileAsync(filePath)),
  '.json': async (filePath) => JSON.parse(await readFileAsync(filePath)),
}

const configFileExts = ['.yml', '.json']

const createFileConfig = async () => {
  const filePaths = uniqWith(
    await fg(configFileExts.map((ext) => `src/html/_data/*${ext}`)),
    (a, b) => parse(a).name === parse(b).name,
  )
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
  const pagePath = toPosixPath(
    join('/', replaceExt(relative('src/html', pageFilePath), '.html')),
  ).replace(/\/index\.html$/, '/')
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
  absPath: (pagePath = '') => toPosixPath(join(basePath, pagePath)),
  assetPath: (pagePath = '') => toPosixPath(join(assetPath, pagePath)),
  absUrl: (pagePath = '') => `${baseUrl}${toPosixPath(join('/', pagePath))}`,
  assetUrl: (pagePath = '') =>
    `${baseAssetUrl}${toPosixPath(join('/', pagePath))}`,
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
  const [preferredFilePath] = (await fg([
    join('vendor-public', basePath, filePath),
    join('public', filePath),
  ])).map(normalize)
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
    return render(src.toString(), config)
  } catch (err) {
    if (isProd) {
      throw err
    }
    console.error(err.stack)
    return renderError(err)
  }
}

module.exports = renderHtml
