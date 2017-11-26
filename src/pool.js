var client = require('./client')

module.exports = function (options) {
  var workers = []
  var availableWorkers = []
  var queuedRequests = []

  options = Object.assign({
    poolSize: (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 2,
    workerPath: 'parallel-module.js',
    workerConstructor: (typeof Worker !== 'undefined' && Worker),
  }, options)

  return createWorker().then(function (workerApi) {
    return Object.keys(workerApi).reduce(function (api, property) {
      api[property] = function () {
        var args = Array.prototype.slice.apply(arguments)

        if(availableWorkers.length > 0) {
          return invokeApiFunction()
        } else if (workers.length < options.poolSize) {
          return createWorker().then(invokeApiFunction)
        } else {
          return queueRequest()
        }

        function invokeApiFunction() {
          var worker = availableWorkers.shift()
          return worker.api[property].apply(worker, args)
            .then(result => {
              availableWorkers.push(worker)
              return result
            })
            // need .finally...
            .catch(error => {
              availableWorkers.push(worker)
              throw error
            })
        }

        function executeQueuedRequest() {
          if(queuedRequests.length > 0 && availableWorkers.length > 0) {
            queuedRequests.shift()()
          }
        }

        function queueRequest() {
          return new Promise(function (resolve, reject) {
            queuedRequests.push(function () {
              invokeApiFunction().then(resolve).catch(reject)
            })
          })
        }
      }
      return api
    }, {})
  })

  function createWorker() {
    var worker = options.workerFactory
      ? options.workerFactory()
      : new (options.workerConstructor)(path)

    return client(worker, options.parameter)
      .then(api => {
        var container = { api: api, worker: worker }
        workers.push(container)
        availableWorkers.push(container)
        return api
      })
  }
}
