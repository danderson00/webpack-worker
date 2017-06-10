import api from 'webpack-worker/api'
import parseFile from './parseFile'
import topTenMovers from './topTenMovers'
import 'aggregate-array-extensions'

// we can perform initialization by returning a promise here
// arguments are passed from the client
api(filename =>
  fetch(filename)
    .then(response => response.text())
    .then(text => {
      var data = parseFile(text)
      // then return the api we want to expose at the end of the promise chain
      return {
        topTenMovers: filter => topTenMovers(data, filter)
      }
    })
)

