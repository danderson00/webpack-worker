module.exports = (worker, param) => {
  const nextId = ((id = 0) => () => ++id)()

  let operations = {}

  worker.onmessage = e => operations[e.data.id].messageHandler(e.data)

  let initId = nextId()

  return attachSubscribeFunction(initId,
    execute(initId, { type: 'init', param: param })
      .then(result => {
        switch(result.type) {
          case 'process':
            return result.result
          case 'api':
            return {
              invoke: (operation, param) => execute(nextId(), { type: 'invoke', param, operation }),
              terminate: () => worker.terminate()
            }
        }
      })
  )

  function execute(id, payload) {
    return attachSubscribeFunction(id, new Promise((resolve, reject) => {
      worker.postMessage(Object.assign({ id: id }, payload))
      operations[id] = {
        listeners: [],
        messageHandler: response => {
          // if the message has user content, we want to broadcast this to any registered listeners
          if(response.user) {
            operations[id].listeners.forEach(listener => listener(response.user))
          } else {
            // otherwise, assume the operation completed and resolve or reject the promise accordingly
            delete operations[id]
            if(response.error)
              reject(response.error)
            else
              resolve(response.result)
          }
        }
      }
    }))
  }

  function attachSubscribeFunction(id, target) {
    target.subscribe = function(callback) {
      operations[id].listeners.push(callback)
    }
    return target
  }
}