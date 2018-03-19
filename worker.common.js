module.exports = function (self) {
  var common = { 
    emit: function(id) {
      return function(data) {
        self.postMessage(Object.assign({ id: id }, data), '*')
      }
    },
    wrapError: function(error) {
      return isError(error) ? { message: error.message, stack: error.stack } : error
    },
    emitError: function(emit) {
      return function(error) {
        emit({ error: common.wrapError(error) })
      }
    },
    userEmit: function(emit) {
      userEmit = function(userData) { 
        emit({ user: userData })
      }
      userEmit.delayed = function(userData) { 
        return function(valueToChain) { 
          emit({ user: userData }) 
          return valueToChain
        }
      }
      return userEmit
    }
  }
  return common
}

function isError(target) {
  return !!(target && (target.constructor === Error || ['error', 'exception'].some(function(word) { 
    return target.constructor.prototype.constructor.name.toLowerCase().includes(word) 
  })))
}