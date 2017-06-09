import api from 'webpack-worker/api'
import parseFile from './parseFile'
import topFiveMovers from './topFiveMovers'

// we can perform initialization by returning a promise here
// arguments are passed from the client
api(filename =>
  self.fetch(filename)
    .then(response => response.text())
    .then(text => {
      var data = parseFile(text)
      // return the api we want to expose at the end of the promise chain
      return {
        topFiveMovers: filter => topFiveMovers(data, filter)
      }
    })
)

