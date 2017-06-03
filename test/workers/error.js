require('../../process')(type => {
  if(type === 'error')
    throw new Error('test')
  return Promise.reject({ code: 'test' })
})
