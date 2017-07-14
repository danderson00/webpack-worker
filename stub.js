module.exports = function (workerDefinition, workerFactory) {
  var hostStub = {
    postMessage: function (message) {
      workerStub.onmessage && workerStub.onmessage({ data: message })
    }
  }
  var workerStub = {
    postMessage: function (message) {
      hostStub.onmessage && hostStub.onmessage({ data: message })
    },
    close: function() { }
  }

  workerFactory(workerDefinition, workerStub)

  return hostStub
}
