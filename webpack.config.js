const path = require('path')
const webpack = require('webpack')
const siteConfig = require('./realworld.config')

const isProd = process.argv.includes('--prod')
const destAssetsDir = path.join(isProd ? 'dist' : 'tmp', siteConfig.basePath || '', 'assets')

module.exports = {
  entry: './src/js/main.js',
  output: {
    path: path.join(__dirname, destAssetsDir, 'js'),
    publicPath: path.posix.join(siteConfig.basePath || '/', 'assets', 'js', '/'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src', 'js'),
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            ['env', {
              targets: {
                modules: false,
                useBuiltIns: true,
              },
            }],
          ],
          plugins: [
            'transform-class-properties',
            'transform-object-rest-spread',
          ],
          cacheDirectory: true,
        },
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
        beautify: false,
        mangle: {
          screw_ie8: true,
          keep_fnames: true,
        },
        compress: {
          screw_ie8: true,
        },
        comments: false,
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
    ] : []),
  ],
  devtool: !isProd && 'cheap-module-source-map',
}
