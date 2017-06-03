var Worker = require('tiny-worker')
var client = require('../client')
var setup = require('./setup')
var path = require('path')

beforeAll(setup)
var worker = name => new Worker(path.join(__dirname, `build/${name}.js`))

test("synchronous process returns result", () =>
  client(worker('sync'), 2).then(result => expect(result).toBe(4))
)

test("asynchronous process returns result", () =>
  client(worker('async'), 2).then(result => expect(result).toBe(6))
)

test("thrown errors are flowed", () => 
  client(worker('error'), 'error')
    .then(() => { throw new Error('Error did not flow') })
    .catch(error => expect(error.message).toBe('test'))
)

test("promise rejections are flowed", () =>
  client(worker('error'))
    .then(() => { throw new Error('Promise rejection did not flow') })
    .catch(error => expect(error).toEqual({ code: 'test' }))
)

test("emit from process can be subscribed to", () => {
  var process = client(worker('emit'))
  var emits = []
  process.subscribe(data => emits.push(data))
  return process.then(result => {
    expect(emits).toEqual(['stage 1', { stage: 2 }])
    expect(result).toBe('complete')
  })
})