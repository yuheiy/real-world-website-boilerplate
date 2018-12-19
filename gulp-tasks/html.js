const { buildFiles } = require('../lib/siteGenerator')
const siteGeneratorConfig = require('../config/siteGenerator')

const html = () => {
  return buildFiles(siteGeneratorConfig)
}

module.exports = html
