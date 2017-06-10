# webpack-worker

webpack-worker is a tiny library that greatly simplifies running CPU intensive 
work on another thread in the browser.

For a detailed walk-through of using `webpack-worker`, see the blog post [here](https://github.com/danderson00/webpack-worker/blob/master/samples/plotly/blog.md).

## Installation

    npm i --save webpack-worker

## Usage

`webpack-worker` provides two different styles of workers - processes and APIs.

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
  .subscribe(message => console.log(message))
  .then(processedData => {
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

## Configuring webpack

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

### Configuring a create-react-app Application

There are a few extra steps involved in configuring react applications created with `create-react-app`. Unfortunately, `create-react-app` does not support customising the webpack configuration, so we'll need to eject by running `npm run eject`. This leaves us with a `config` folder that contains webpack configuration.

After we've ejected, we need to add the entry point to the configuration by changing the `entry` node to a hash containing the original array, similar to above:

```Javascript
  entry: {
    app: [
      // previous entry node here
    ],
    worker: require.resolve('../src/worker')
  },
```

Then, we need to include the bundle name in the the output filename:

```Javascript
  output: {
    // ...
    filename: 'static/js/[name].bundle.js',
    // ...
  },
```

`create-react-app` uses a [webpack plugin](https://github.com/jantimon/html-webpack-plugin) called `html-webpack-plugin` creates an `index.html` that loads all entry points when the page is rendered. We need to prevent the worker bundle from being loaded on page render as it's loaded when the worker is created.

Under the `plugins` node, you'll find an entry that looks like the following. Add an `excludeChunks` property that matches the name of the entry point:

```Javascript
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      excludeChunks: ['worker']
    }),
```

## License

MIT