var webpack = require('webpack')
var path = require('path')

module.exports = () => new Promise((resolve, reject) => {
  webpack({
    entry: {
      api: path.join(__dirname, 'workers', 'api.js'),
      sync: path.join(__dirname, 'workers', 'sync.js'),
      async: path.join(__dirname, 'workers', 'async.js'),
      error: path.join(__dirname, 'workers', 'error.js'),
      emit: path.join(__dirname, 'workers', 'emit.js')
    },
    output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].js'
    }
  }, (err, stats) => {
    if(err || stats.hasErrors())
      reject(err)
    else
      resolve()
  })
})
