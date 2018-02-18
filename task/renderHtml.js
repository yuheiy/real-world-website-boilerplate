const path = require('path')
const replaceExt = require('replace-ext')
const globby = require('globby')
const yaml = require('js-yaml')
const pug = require('pug')
const { isProd, basePath, baseUrl, readFileAsync } = require('./util')

const dataFileExts = ['.yml', '.yaml', '.json']

const readFileData = async () => {
    const filePaths = (await globby(
        dataFileExts.map((ext) => `src/html/_data/*${ext}`),
        {
            nodir: true,
        },
    )).filter((filePath, idx, arr) => {
        const { name } = path.parse(filePath)
        const prevNames = arr.slice(0, idx).map((item) => path.parse(item).name)
        return !prevNames.includes(name)
    })
    const fileData = await Promise.all(
        filePaths.map(async (filePath) => ({
            name: path.parse(filePath).name,
            data: yaml.safeLoad(await readFileAsync(filePath, 'utf8')),
        })),
    )
    const gatheredFileData = fileData.reduce(
        (result, { name, data }) => ({
            ...result,
            [name]: data,
        }),
        {},
    )
    return gatheredFileData
}

const readPageData = async (pageFilePath) => {
    const [filePath] = await globby(
        dataFileExts.map((ext) => replaceExt(pageFilePath, ext)),
        {
            nodir: true,
        },
    )
    const fileData = filePath
        ? yaml.safeLoad(await readFileAsync(filePath))
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

const pugConfig = {
    basedir: './src/html',
}
const baseLocals = {
    __DEV__: !isProd,
    absPath: (pagePath) => path.posix.join(`${basePath}/`, pagePath),
    assetPath: (pagePath) =>
        path.posix.join(`${basePath}/`, 'assets', pagePath),
    absUrl: (pagePath) => `${baseUrl}${path.posix.join('/', pagePath)}`,
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

const renderHtml = async (filePath) => {
    try {
        const config = await createTemplateConfig(filePath)
        return pug.renderFile(filePath, config)
    } catch (err) {
        if (isProd) {
            throw err
        }

        console.error(err.stack)
        return renderError(err)
    }
}

module.exports = renderHtml
