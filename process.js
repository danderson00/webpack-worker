/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
module.exports = worker => {
  onmessage = e => {
    const emit = data => self.postMessage(Object.assign({ id: e.data.id }, data))
    const wrapError = error => (error && error.constructor === Error) ? { message: error.message, stack: error.stack } : error
    const emitError = error => emit({ error: wrapError(error) })

    let userEmit = user => emit({ user })
    userEmit.delayed = user => valueToChain => emit({ user }) || valueToChain

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
