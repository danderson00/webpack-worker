require('../../api')(baseValue => ({
  multiply: value => baseValue * value,
  power: value => sleep(10, Math.pow(baseValue, value)),
  error: () => { throw new Error('test') },
  reject: () => Promise.reject({ code: 'test' })
}))

function sleep(time, result) {
  return new Promise((resolve) => setTimeout(() => resolve(result), time));
}