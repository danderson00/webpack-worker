/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
var common = require('./worker.common')

module.exports = worker => {
  let operations

  onmessage = e => {
    const emit = data => self.postMessage(Object.assign({ id: e.data.id }, data))
    const emitError = common.emitError(emit)
    const userEmit = common.userEmit(emit)

    try {
      switch(e.data.type) {
        case 'init':
          Promise.resolve(worker(e.data.param, userEmit))
            .then(result => {
              operations = result
              emit({ result: { type: 'api', operations: Object.keys(result) } })
            })
            .catch(error => {
              emitError(error)
              close()
            })
          break;

        case 'invoke':
          if(!operations[e.data.operation])
            emitError(new Error(`Unknown operation: ${e.data.operation}`))
          
            Promise.resolve(operations[e.data.operation](e.data.param, userEmit))
              .then(result => emit({ result }))
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
