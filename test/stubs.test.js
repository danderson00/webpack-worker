var client = require('../src/client')
var process = require('../src/process')
var api = require('../src/api')
var stubs = require('./workers/stubs')

// these things really shouldn't exist
// they will likely be removed

test("stubbed process returns result", () => 
  client(process.stub(stubs.process), 2)
    .then(result => expect(result).toBe(6))
)

test("stubbed api returns result", () =>
  client(api.stub(stubs.api))
    .then(api => api.double(6))
    .then(result => expect(result).toBe(12))
)