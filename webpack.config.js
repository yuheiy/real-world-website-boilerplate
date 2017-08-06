const path = require('path')
const webpack = require('webpack')
const siteConfig = require('./realworld.config')

const isProd = process.argv.includes('--prod')
const destAssetsDir = path.join(isProd ? 'dist' : 'tmp', siteConfig.baseDir || '', 'assets')

module.exports = {
  entry: './src/js/main.js',
  output: {
    path: path.join(__dirname, destAssetsDir, 'js'),
    publicPath: path.posix.join(siteConfig.baseDir || '/', 'assets', 'js', '/'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src', 'js'),
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    ...(isProd ? [
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          comparisons: false,
        },
        output: {
          comments: false,
          ascii_only: true,
        },
      }),
    ] : []),
  ],
  devtool: !isProd && 'cheap-module-source-map',
}
