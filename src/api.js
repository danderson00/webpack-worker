/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
var commonFactory = require('./worker.common')
var stub = require('./stub')

module.exports = function(worker, host) {
  host = host || self

  var operations

  host.onmessage = function(e) {
    var common = commonFactory(host || self)
    var emit = common.emit(e.data.id)
    var emitError = common.emitError(emit)
    var userEmit = common.userEmit(emit)

    try {
      switch(e.data.type) {
        case 'init':
          Promise.resolve(worker(e.data.param, userEmit))
            .then(function(result) {
              operations = result
              emit({ result: { type: 'api', operations: Object.keys(result) } })
            })
            .catch(function(error) {
              emitError(error)
              host.close()
            })
          break;

        case 'invoke':
          if(!operations[e.data.operation])
            emitError(new Error('Unknown operation: ' + e.data.operation))
          
            Promise.resolve(operations[e.data.operation](e.data.param, userEmit))
              .then(function(result) { emit({ result: result }) })
              .catch(emitError)
          break;

        default:
          emitError(new Error('Unknown internal operation: ' + e.data.type))
      }
    } catch(error) {
      emitError(error)
      host.close()
    }
  }
}

module.exports.stub = function(worker) {
  return stub(worker, module.exports)
}