/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
var common = require('./worker.common')

module.exports = function(worker) {
  onmessage = function(e) {
    var emit = common.emit(e.data.id)
    var emitError = common.emitError(emit)
    var userEmit = common.userEmit(emit)

    try {
      switch(e.data.type) {
        case 'init':
          Promise.resolve(worker(e.data.param, userEmit))
            .then(function(result) {
              emit({ result: { type: 'process', result: result } })
              close()
            })
            .catch(function(error) {
              emitError(error)
              close()
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
      close()
    }
  }
}
