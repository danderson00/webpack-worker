# webpack-worker

webpack-worker is a tiny library that greatly simplifies running CPU intensive 
work on another thread in the browser.

## Installation

    npm i --save webpack-worker

## Usage

There are two different styles of workers - processes and APIs.

### Process

The process is intended to represent long running processes with a defined 
start and end. Your worker file will look something like:

```Javascript
var process = require('webpack-worker/process')
var data = require('my-data-library')

process((params, emit) => {
  emit('Starting process')
  return data.fetch(params.query)
    .then(result => {
      emit('Loaded data')
      // ... do CPU intensive operation...
      return processedData
    })
})

```

This file will be run through webpack as an entry point (more on this later).
To execute the process and monitor for any emitted events:

```Javascript
var client = require('webpack-worker/client')
var worker = new Worker('process.bundle.js')
var process = client(worker, { query: 'my query' })
process.subscribe(message => console.log(message))
process.then(processedData => {
  // ... do stuff with your data!
})
```

Once the promise returned from the worker process resolves, the worker will terminate.

### API

API workers, on the other hand, are intended to be a persistent process that
commands can be issued to. An example worker definition:

```Javascript
var api = require('webpack-worker/api')
var data = require('my-data-library')
var bigCalculation = require('big-calculation-library')

// we can perform initialization that returns a promise
// then return the API structure you want to expose
api(baseValue => data.load(baseValue).then(data => ({
  multiply: value => baseValue * value,
  power: value => Math.pow(baseValue, value),
  bigCalculation: value => bigCalculation(data, value)
})))
```

To call our API:

```Javascript
var client = require('webpack-worker/client')
var worker = new Worker('api.bundle.js')

client(worker, 123).then(api => {
  api.multiply(32).then(result => console.log(result /* 4224 */))
  api.bigCalculation({ data: { a: 1 } }).then(result => /* do stuff with result */)
})
```

## Configuration

Configuring webpack is as simple as adding an entry point to the webpack configuration:

```Javascript
module.exports = {
  entry: {
    app: require.resolve('index.js'),
    process: require.resolve('process.worker.js'),
    api: require.resolve('api.worker.js')
  },
  output: {
    path: 'build',
    filename: '[name].bundle.js'
  }
}
```

## License

MIT