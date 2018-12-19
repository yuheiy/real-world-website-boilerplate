const del = require('del')
const { destDir } = require('../config/path')

const clean = () => {
  return del(destDir)
}

module.exports = clean
