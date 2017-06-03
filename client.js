module.exports = (worker, param) => {
  const nextId = ((id = 0) => () => ++id)()

  let operations = {}
  // let worker = new Worker(`/static/js/${name}.bundle.js`)

  worker.onmessage = e => operations[e.data.id](e.data)

  return execute({ type: 'init', param: param })
    .then(result => {
      switch(result.type) {
        case 'process':
          return result.result
        case 'api':
          return {
            invoke: (operation, param) => execute({ type: 'invoke', param: param, operation: operation }),
            terminate: () => worker.terminate()
          }
      }
    })

  function execute(payload) {
    return new Promise((resolve, reject) => {
      let id = nextId()
      worker.postMessage(Object.assign({ id: id }, payload))
      operations[id] = response => {
        delete operations[id]
        if(response.error)
          reject(response.error)
        else
          resolve(response.result)
      }
    })
  }
}