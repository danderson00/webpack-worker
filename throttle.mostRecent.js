// intended for fire and forget operations
// if the function is executed while an existing operation in in progress, 
// only the most recent subsequent execution will be triggered when the operation completes
module.exports = function throttle(func) {
  let current, next

  const executeNext = () => {
    if(next) {
      current = next()
      next = undefined
      current.then(() => {
        current = undefined
        executeNext()
      })
    }
  }

  return function injected() {
    var args = Array.from(arguments)
    var result = new Promise((resolve, reject) => {
      if(next)
        next.drop()

      next = () => Promise.resolve(func.apply(this, args))
        .then(result => resolve(result))
        .catch(error => reject(error))

      next.drop = () => {
        var error = new Error('The operation was dropped')
        error.dropped = true
        reject(error)
      }

      if(!current) executeNext()
    })
    return result;
  }
}

module.exports.applyTo = function (target) {
  return Object.keys(target).reduce((result, property) => {
    result[property] = typeof target[property] === 'function' ? module.exports(target[property]) : target[property]
    return result
  }, {})
}