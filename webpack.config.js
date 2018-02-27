const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const LicenseBannerPlugin = require('license-banner-webpack-plugin')
const { isProd, destAssetDir } = require('./task/util')

module.exports = {
  entry: './src/js/main.js',
  output: {
    path: path.join(__dirname, destAssetDir, 'js'),
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
              [
                'env',
                {
                  modules: false,
                  useBuiltIns: true,
                },
              ],
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
    new webpack.EnvironmentPlugin({
      NODE_ENV: isProd ? 'production' : 'development',
    }),
    new webpack.DefinePlugin({
      __DEV__: !isProd,
    }),
    ...(isProd ? [new UglifyJsPlugin(), new LicenseBannerPlugin()] : []),
  ],
  devtool: !isProd && 'cheap-module-source-map',
}
