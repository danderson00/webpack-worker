require('../../src/process')((param, emit) => 
  sleep(10)
    .then(() => emit('stage 1'))
    .then(() => sleep(10))
    .then(() => emit({ stage: 2 }))
    .then(() => sleep(10))
    .then(() => 'complete')
)

function sleep(time, result) {
  return new Promise((resolve) => setTimeout(() => resolve(result), time));
}