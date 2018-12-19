const isDev = !process.argv.includes('--prod')

module.exports = {
  isDev,
}
