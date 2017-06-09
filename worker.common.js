var common = module.exports = { 
  wrapError: error => isError(error) ? { message: error.message, stack: error.stack } : error,
  emitError: emit => error => emit({ error: common.wrapError(error) }),
  userEmit: emit => {
    userEmit = user => emit({ user })
    userEmit.delayed = user => valueToChain => emit({ user }) || valueToChain
    return userEmit
  }
}

function isError(target) {
  return !!(target && (target.constructor === Error || ['error', 'exception'].some(word => target.constructor.prototype.constructor.name.toLowerCase().includes(word))))
}