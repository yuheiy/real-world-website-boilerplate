const { basename, dirname, extname, join } = require('path')
const { existsSync } = require('fs')
const { readFileAsync } = require('./util')

const uniq = (arr) => {
  return [...new Set(arr)]
}

const cssImporter = (url, prev, done) => {
  const specifiedPath = join(dirname(prev), url)
  const hasExt = Boolean(extname(specifiedPath))

  if (hasExt) {
    return null
  }

  const resolvedDir = dirname(specifiedPath)
  const specifiedName = basename(specifiedPath)
  const candidateNames = uniq([
    specifiedName,
    specifiedName.replace(/^_/, ''),
    `_${specifiedName}`,
  ])

  for (const ext of ['.sass', '.scss']) {
    const isFileExists = candidateNames
      .map((name) => join(resolvedDir, `${name}${ext}`))
      .some((filePath) => existsSync(filePath))

    if (isFileExists) {
      return null
    }
  }

  const cssFilePath = join(resolvedDir, `${specifiedName}.css`)
  const isCssFileExists = existsSync(cssFilePath)

  if (isCssFileExists) {
    readFileAsync(cssFilePath, 'utf8').then((contents) => done({ contents }))
  } else {
    done(new Error(`File to import not found: ${url}.`))
  }
}

module.exports = cssImporter
