var webpack = require('webpack')
var path = require('path')

module.exports = () => new Promise((resolve, reject) => {
  webpack({
    entry: {
      sync: [path.join(__dirname, 'workers', 'process.sync.js')],
      async: [path.join(__dirname, 'workers', 'process.async.js')],
      error: [path.join(__dirname, 'workers', 'process.error.js')],
      api: [path.join(__dirname, 'workers', 'api.js')]
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
