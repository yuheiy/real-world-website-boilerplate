const { join } = require('path')
const { readFileAsync } = require('../../lib/fs')

module.exports = async () => {
  return {
    title: 'ライセンス',
    description: '本プロジェクトはMITライセンスです。',
    licenseContent: await readFileAsync(
      join(__dirname, '../../LICENSE'),
      'utf8',
    ),
  }
}
