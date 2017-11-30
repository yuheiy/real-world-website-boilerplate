const path = require('path')
const webpack = require('webpack')
const LicenseBannerPlugin = require('license-banner-webpack-plugin')
const siteConfig = require('./realworld.config')

const isProd = process.argv[2] === 'build'
const destDir = isProd ? 'dist' : 'tmp'
const destBaseDir = path.join(destDir, siteConfig.basePath || '')
const destAssetsDir = path.join(destBaseDir, 'assets')

module.exports = {
  entry: './src/js/main.js',
  output: {
    path: path.join(__dirname, destAssetsDir, 'js'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src', 'js'),
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              ['env', {
                modules: false,
                useBuiltIns: true,
              }],
            ],
            plugins: [
              'transform-class-properties',
              'transform-object-rest-spread',
            ],
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  plugins: [
    ...(isProd ? [
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
        DEBUG: false,
      }),
      new LicenseBannerPlugin(),
    ] : []),
  ],
  devtool: !isProd && 'cheap-module-source-map',
}
