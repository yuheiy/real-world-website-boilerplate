const { join } = require('path')
const { DefinePlugin } = require('webpack')
const LicenseBannerPlugin = require('license-banner-webpack-plugin')
const { isProd, destAssetDir } = require('./task/util')

module.exports = {
  entry: './src/js/main.js',
  output: {
    path: join(__dirname, destAssetDir, 'js'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: join(__dirname, 'src/js'),
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
    new DefinePlugin({
      __DEV__: !isProd,
    }),
    ...(isProd ? [new LicenseBannerPlugin()] : []),
  ],
  mode: isProd ? 'production' : 'development',
}
