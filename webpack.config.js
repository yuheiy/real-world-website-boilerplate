const path = require('path')
const webpack = require('webpack')
const LicenseInfoWebpackPlugin = require('license-info-webpack-plugin').default
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
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
    new webpack.DefinePlugin({
      __DEV__: !isProd,
    }),
    ...(isProd
      ? [new LicenseInfoWebpackPlugin({ includeLicenseFile: false })]
      : []),
  ],
  mode: isProd ? 'production' : 'development',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        // https://github.com/webpack/webpack/blob/5238159d211576bb313d99d487e415f3799af795/lib/WebpackOptionsDefaulter.js#L268-L270
        cache: true,
        parallel: true,
        sourceMap: !isProd,

        // for license-info-webpack-plugin
        uglifyOptions: {
          output: {
            comments: /^\**!|@preserve|@license|@cc_on/,
          },
        },
      }),
    ],
  },
}
