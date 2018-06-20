const { join } = require('path')
const { DefinePlugin } = require('webpack')
const LicenseInfoWebpackPlugin = require('license-info-webpack-plugin').default
const { isProd, assetPath, destAssetDir, toPosixPath } = require('./task/util')

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: './src/js/main.js',
  output: {
    path: join(__dirname, destAssetDir, 'js'),
    filename: '[name].bundle.js',
    publicPath: toPosixPath(join(assetPath, 'js/')),
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
  devtool: !isProd && 'cheap-module-source-map',
  plugins: [
    new DefinePlugin({
      __DEV__: !isProd,
    }),
    isProd &&
      new LicenseInfoWebpackPlugin({
        includeLicenseFile: false,
      }),
  ].filter(Boolean),
}
