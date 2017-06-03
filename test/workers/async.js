require('../../process')(value => sleep(10, value * 3))

function sleep(time, result) {
  return new Promise((resolve) => setTimeout(() => resolve(result), time));
}