const path = require('path');
const webpack = require('webpack');
const LicenseBannerPlugin = require('license-banner-webpack-plugin');
const { isProd, destAssetsDir } = require('./task/util');

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
                            [
                                'env',
                                {
                                    modules: false,
                                    useBuiltIns: true,
                                },
                            ],
                        ],
                        plugins: ['transform-class-properties', 'transform-object-rest-spread'],
                        cacheDirectory: true,
                    },
                },
            },
        ],
    },
    plugins: [
        ...(isProd
            ? [
                  new webpack.optimize.UglifyJsPlugin(),
                  new webpack.EnvironmentPlugin({
                      NODE_ENV: 'production',
                      DEBUG: false,
                  }),
                  new LicenseBannerPlugin(),
              ]
            : [
                  new webpack.EnvironmentPlugin({
                      NODE_ENV: 'development',
                      DEBUG: true,
                  }),
              ]),
    ],
    devtool: !isProd && 'cheap-module-source-map',
};
