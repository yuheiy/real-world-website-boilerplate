const path = require('path')
const importFresh = require('import-fresh')
const cloneDeep = require('lodash.clonedeep')
const parseYaml = require('js-yaml').safeLoad
const PluginError = require('plugin-error')
const uniqBy = require('lodash.uniqby')
const fg = require('fast-glob')
const replaceExt = require('replace-ext')
const pug = require('gulp-pug')
const data = require('gulp-data')
const { toPOSIXPath } = require('../../lib/path')
const { readFileAsync } = require('../../lib/fs')
const { isDev } = require('../flag')
const { basePath, assetsPath } = require('../path')
const { inputDir, sharedLocalDir } = require('./settings')

const defaultLocals = {
  absPath: (filePath = '') => toPOSIXPath(path.join('/', basePath, filePath)),
  assetPath: (filePath = '') =>
    toPOSIXPath(path.join('/', assetsPath, filePath)),
  __DEV__: isDev,
}

const readFile = async (filePath) => {
  return {
    path: filePath,
    contents: await readFileAsync(filePath, 'utf8'),
  }
}

const readFiles = async (filePaths) => {
  const tasks = filePaths.map(readFile)
  return await Promise.all(tasks)
}

const parsers = new Map()
parsers.set('.js', async (file) => {
  const importedModule = importFresh(file.path)
  const value =
    typeof importedModule === 'function'
      ? await importedModule(defaultLocals)
      : importedModule
  return cloneDeep(value)
})
parsers.set('.yml', (file) => parseYaml(file.contents))
parsers.set('.yaml', parsers.get('.yml'))
parsers.set('.json', (file) => JSON.parse(file.contents))

const localFileExts = [...parsers.keys()]

const parseFile = async (file) => {
  try {
    const { name, ext } = path.parse(file.path)
    const parse = parsers.get(ext)
    const value = await parse(file)

    return {
      key: name,
      value,
    }
  } catch (err) {
    const pluginError = new PluginError('parseFile', err, {
      fileName: file.path,
    })
    throw pluginError
  }
}

const parseFiles = async (files) => {
  const tasks = files.map(parseFile)
  return await Promise.all(tasks)
}

const readDataLocals = async () => {
  const localFilePaths = uniqBy(
    await fg(localFileExts.map((ext) => path.join(sharedLocalDir, `*${ext}`)), {
      absolute: true,
    }),
    (filePath) => path.parse(filePath).name,
  )
  const files = await parseFiles(await readFiles(localFilePaths))
  const dataLocals = files.reduce((memo, { key, value }) => {
    memo[key] = value
    return memo
  }, {})
  return dataLocals
}

const readPageLocals = async (filePath) => {
  const [localFilePath] = await fg(
    localFileExts.map((ext) => replaceExt(filePath, ext)),
  )

  let file
  if (localFilePath) {
    file = await parseFile(await readFile(localFilePath))

    if (typeof file.value !== 'object') {
      throw new TypeError(
        `${localFilePath} must export an object or a function that returns an object`,
      )
    }
  } else {
    file = {
      value: null,
    }
  }

  const filePathFromInputDir = path.relative(path.resolve(inputDir), filePath)
  const pagePath = toPOSIXPath(
    path.join('/', replaceExt(filePathFromInputDir, '.html')),
  ).replace(/\/index\.html$/, '/')
  const pageLocals = {
    ...file.value,
    path: pagePath,
  }
  return pageLocals
}

const readLocals = async (file) => {
  return {
    ...defaultLocals,
    data: await readDataLocals(),
    page: await readPageLocals(file.path),
  }
}

const pugOpts = {
  basedir: inputDir,
}

const task = (stream, handleError) => {
  return stream
    .pipe(data(readLocals))
    .on('error', handleError)
    .pipe(pug(pugOpts))
    .on('error', handleError)
}

module.exports = task
