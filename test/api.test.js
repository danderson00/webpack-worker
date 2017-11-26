var Worker = require('tiny-worker')
var client = require('../src/client')
var setup = require('./setup')
var path = require('path')
var api

beforeAll(setup)
beforeEach(() => client(new Worker(path.join(__dirname, 'build/api.js')), 2).then(clientApi => api = clientApi))
afterEach(() => api.terminate())

test("synchronous api call returns result", () => 
  api.multiply(4).then(result => expect(result).toBe(8))
)

test("asynchronous api call returns result", () => 
  api.power(3).then(result => expect(result).toBe(8))
)

test("thrown errors are flowed", () => 
  api.error()
    .then(() => { throw new Error('Error did not flow') })
    .catch(error => expect(error.message).toBe('test'))
)

test("promise rejections are flowed", () => 
  api.reject()
    .then(() => { throw new Error('Promise rejection did not flow') })
    .catch(error => expect(error).toEqual({ code: 'test' }))
)

test("emit from api call can be subscribed to", () => {
  var emits = []
  return api.emit()
    .subscribe(data => emits.push(data))
    .then(result => {
      expect(emits).toEqual(['stage 1', { stage: 2 }])
      expect(result).toBe('complete')
    })
})

// tiny-worker probably doesn't support transfer!
// test("ArrayBuffer objects can be passed as parameters", () => 
//   api.buffer(new ArrayBuffer(8))
//     .then(length => expect(length).toBe(true))
// )
