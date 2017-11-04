const path = require('path')
const webpack = require('webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const LicenseBannerPlugin = require('license-banner-webpack-plugin')
const siteConfig = require('./realworld.config')

module.exports = ({production}) => {
  const destAssetsDir = path.join(production ? 'dist' : 'tmp', siteConfig.basePath || '', 'assets')

  return {
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
      ...(production ? [
        new UglifyJSPlugin(),
        new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': JSON.stringify('production'),
          },
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new LicenseBannerPlugin(),
      ] : []),
    ],
    devtool: !production && 'cheap-module-source-map',
  }
}
