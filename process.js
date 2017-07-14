/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
var commonFactory = require('./worker.common')
var stub = require('./stub')

module.exports = function(worker, host) {
  host = host || self
  host.onmessage = function(e) {
    var common = commonFactory(host)
    var emit = common.emit(e.data.id)
    var emitError = common.emitError(emit)
    var userEmit = common.userEmit(emit)

    try {
      switch(e.data.type) {
        case 'init':
          Promise.resolve(worker(e.data.param, userEmit))
            .then(function(result) {
              emit({ result: { type: 'process', result: result } })
              host.close()
            })
            .catch(function(error) {
              emitError(error)
              host.close()
            })
          break;

        case 'invoke':
          emitError(new Error('Invoke not allowed with process workers'))
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