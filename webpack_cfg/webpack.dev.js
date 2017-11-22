const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('../webpack.config.js');
const path = require('path');

module.exports = merge(common, {
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
    port: 7070,
    noInfo: false,
    host: 'localhost'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});