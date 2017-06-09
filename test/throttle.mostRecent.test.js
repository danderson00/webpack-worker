var throttle = require('../throttle.mostRecent')

test("queues executions", done => {
  let o = generateOperation()
  o.operation(1)
  o.operation(2)
  expect(o.operations.map(x => x.resolved)).toEqual([false])
  o.operations[0].trigger()
  // not sure why this doesn't happen synchronously...
  setTimeout(() => {
    expect(o.operations.map(x => x.resolved)).toEqual([true, false])
    o.operations[1].trigger()
    setTimeout(() => {
      expect(o.operations.map(x => x.resolved)).toEqual([true, true])
      expect(o.operations.map(x => x.args)).toEqual([[1], [2]])
      done()
    })
  })
})

test("rejects intermediate executions", done => {
  let rejected = false
  let o = generateOperation()
  o.operation(1, 2)
  o.operation(2, 3).catch(() => rejected = true)
  o.operation(3, 4)
  expect(o.operations.map(x => x.resolved)).toEqual([false])
  o.operations[0].trigger()
  // not sure why this doesn't happen synchronously...
  setTimeout(() => {
    expect(o.operations.map(x => x.resolved)).toEqual([true, false])
    o.operations[1].trigger()
    setTimeout(() => {
      expect(o.operations.map(x => x.resolved)).toEqual([true, true])
      expect(o.operations.map(x => x.args)).toEqual([[1, 2], [3, 4]])
      expect(rejected).toBe(true)
      done()
    })
  })
})

test("rejecting promise executes next operation", done => {
  let o = generateOperation()
  o.operation(1)
  o.operation(2)
  expect(o.operations.map(x => x.resolved)).toEqual([false])
  o.operations[0].fail()
  // not sure why this doesn't happen synchronously...
  setTimeout(() => {
    expect(o.operations.map(x => x.resolved)).toEqual([false, false])
    o.operations[1].trigger()
    setTimeout(() => {
      expect(o.operations.map(x => x.resolved)).toEqual([false, true])
      expect(o.operations.map(x => x.args)).toEqual([[1], [2]])
      done()
    })
  })
})

test("applyTo applies throttle function to all functions on an object", () => {
  var result = throttle.applyTo({
    a: () => {},
    b: () => {},
    c: 'test',
    d: undefined
  })

  expect(result.a.name).toBe('injected')
  expect(result.b.name).toBe('injected')
  expect(result.c).toBe('test')
  expect(result.d).toBe(undefined)
})

function generateOperation() {
  let result = { operations: [] }
  result.operation = throttle(function() {
    var operationResult = { resolved: false, args: Array.from(arguments) }
    result.operations.push(operationResult)
    operationResult.promise = new Promise((resolve, reject) => {
      operationResult.trigger = () => {
        resolve()
        operationResult.resolved = true
      }
      operationResult.fail = () => reject()
    })
    return operationResult.promise
  })
  return result
}
