const path = require('path')
const webpack = require('webpack')
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
        new webpack.LoaderOptionsPlugin({
          minimize: true,
          debug: false,
        }),
        new webpack.EnvironmentPlugin({
          NODE_ENV: 'production',
          DEBUG: false,
        }),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new LicenseBannerPlugin(),
      ] : []),
    ],
    devtool: !production && 'cheap-module-source-map',
  }
}
