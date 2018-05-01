const { basename, dirname, extname, join } = require('path')
const { existsSync } = require('fs')
const { readFileAsync } = require('./util')

const uniq = (arr) => {
  return [...new Set(arr)]
}

const cssImporter = (url, prev, done) => {
  const resolvedPath = join(dirname(prev), url)
  const hasExt = Boolean(extname(resolvedPath))

  if (hasExt) {
    return null
  }

  const resolvedDir = dirname(resolvedPath)
  const resolvedName = basename(resolvedPath)
  const candidateNames = uniq([
    resolvedName,
    resolvedName.replace(/^_/, ''),
    `_${resolvedName}`,
  ])

  const isSassFileExists = ['.sass', '.scss'].some((ext) => {
    const isFileExists = candidateNames
      .map((name) => join(resolvedDir, `${name}${ext}`))
      .some((filePath) => existsSync(filePath))
    return isFileExists
  })

  if (isSassFileExists) {
    return null
  }

  const cssFilePath = join(resolvedDir, `${resolvedName}.css`)
  const isCssFileExists = existsSync(cssFilePath)

  if (isCssFileExists) {
    readFileAsync(cssFilePath, 'utf8').then((contents) => done({ contents }))
  } else {
    return new Error(`File to import not found: ${cssFilePath}`)
  }
}

module.exports = cssImporter
