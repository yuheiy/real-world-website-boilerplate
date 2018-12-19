const path = require('path')

const toPOSIXPath = (filePath) => {
  if (path.sep === path.posix.sep) {
    return filePath
  }

  return filePath.replace(
    new RegExp(`\\${path.win32.sep}`, 'g'),
    path.posix.sep,
  )
}

module.exports = {
  toPOSIXPath,
}
