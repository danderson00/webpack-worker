/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
var common = require('./worker.common')

module.exports = worker => {
  onmessage = e => {
    const emit = data => self.postMessage(Object.assign({ id: e.data.id }, data))
    const emitError = common.emitError(emit)
    const userEmit = common.userEmit(emit)

    try {
      switch(e.data.type) {
        case 'init':
          Promise.resolve(worker(e.data.param, userEmit))
            .then(result => {
              emit({ result: { type: 'process', result: result } })
              close()
            })
            .catch(error => {
              emitError(error)
              close()
            })
          break;

        case 'invoke':
          emitError(new Error(`Invoke not allowed with process workers`))
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
