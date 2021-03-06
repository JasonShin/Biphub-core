const webpack = require('webpack')
const base = require('./webpack.base')
const utils = require('./utils')
const config = require('../config')
const FriendlyErrors = require('friendly-errors-webpack-plugin')
base.devtool = 'eval-source-map'
base.plugins.push(
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development'),
    'process.env.SERVER_URL': JSON.stringify(`${config.url}`),
    'process.env.FORWARDED_PORT': JSON.stringify(`${config.forwardedPort}`)
  }),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new FriendlyErrors({
    clearConsole: false
  })
)

// push loader for css files
utils.cssProcessors.forEach(processor => {
  let loaders
  if (processor.loader === '') {
    loaders = ['postcss-loader']
  } else {
    loaders = ['postcss-loader', processor.loader]
  }
  base.module.loaders.push(
    {
      test: processor.test,
      loaders: ['style-loader', utils.cssLoader].concat(loaders)
    }
  )
})

module.exports = base
