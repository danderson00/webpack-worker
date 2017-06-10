/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
var common = require('./worker.common')

module.exports = function(worker) {
  var operations

  onmessage = function(e) {
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
              close()
            })
          break;

        case 'invoke':
          if(!operations[e.data.operation])
            emitError(new Error(`Unknown operation: ${e.data.operation}`))
          
            Promise.resolve(operations[e.data.operation](e.data.param, userEmit))
              .then(function(result) { emit({ result }) })
              .catch(emitError)
          break;

        default:
          emitError(new Error(`Unknown internal operation: ${e.data.type}`))
      }
    } catch(error) {
      emitError(error)
      close()
    }
  }
}
