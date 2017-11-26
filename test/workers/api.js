require('../../src/api')(baseValue => ({
  multiply: value => baseValue * value,
  power: value => sleep(10, Math.pow(baseValue, value)),
  error: () => { throw new Error('test') },
  reject: () => Promise.reject({ code: 'test' }),
  buffer: buffer => buffer.constructor.name,
  emit: (param, emit) => 
    sleep(10)
      .then(() => emit('stage 1'))
      .then(() => sleep(10))
      .then(() => emit({ stage: 2 }))
      .then(() => sleep(10))
      .then(() => 'complete')
}))

function sleep(time, result) {
  return new Promise((resolve) => setTimeout(() => resolve(result), time));
}