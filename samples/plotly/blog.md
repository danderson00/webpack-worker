# Parallelizing Javascript Workloads - Building High Performance Graphs with Plotly and webpack-worker

Recently, we've been playing around with plotting various graphs in a react application with Plotly. It became clear pretty quickly that working with large data sets on the main application thread is simply not an option. Even with a 50ms workload, dragging a date range slider is jarring, not the smooth experience we're after.

Enter WebWorkers. 

WebWorkers allow offloading CPU intensive tasks to other threads and are supported by pretty all modern web browsers. However, they are a very low level mechanism, exposing only a simple message passing API for communication. The `webpack-worker` package provides us with a much simpler and cleaner abstraction for everyday use.

The use case discussed here is purely to demonstrate the impact of using WebWorkers - `webpack-worker` can be used for executing any Javascript code within a WebWorker, not just calculating graph data.

## Setting the Scene

To demonstrate, we're going to build a graph that shows the top 10 movers from some historical stock market data available at http://pages.swcp.com/stocks/. The data consists of a year of stock prices for 242 stocks in CSV format, one line per stock, per day. Each line contains the stock's opening, closing, high and low prices for the day. We're going to add a date range slider to dynamically pick the date range to analyze. 

A basic process for parsing the data into something Plotly can consume might look like:

- Parse CSV into a array sorted by date containing an element for each day. Each element contains the data for each stock for the day
- Filter the array to the selected date range
- Aggregate each stock, calculating the opening and closing value, and the high and low values for the period
- Calculate the relative gain, high and low values for each stock
- Sort by the gain and take the top 10
- Convert to vectors suitable for Plotly

There is a bit of work for the app to do, particularly when working over many years worth of data. The details of the implementation aren't relevant to this post, but the complete sample is available in the github repository.

## Defining Our Worker Code

The `webpack-worker` package provides simple APIs based around promises for declaring and consuming worker code. It provides models for both single long running processes and APIs that can be called multiple times. We're going to use the API model as we will need to recalculate the graph data as the user drags the slider.

Based on our requirements above, our worker might look something like:

```Javascript
import api from 'webpack-worker/api'

// initialization arguments can be passed from the client
api(url => {
  // perform any async initialization required by returning a promise
  fetch(url)
    .then(response => response.text())
    .then(text => {
      var data = parseFile(text)

      // at the end of the promise chain, return the api we want to expose
      return {
        topTenMovers: filter => {
          var filteredData = filterData(data, filter)
          var stocks = aggregateStocks(filteredData)
          var topTen = findTopTen(stocks)
          return mapToVectors(topTen)
        },
        // add other graph definitions here
      }
    })
  }
)
```

You'll notice that this module doesn't export anything. That's because WebWorkers run in an isolated thread - this module is the entry point for the WebWorker. We'll talk about how to use webpack to create a bundle for this a little bit later.

## Consuming Our Worker

`webpack-worker` generates a client API for us, based off the API we specify in the worker. Note that currently only a single argument can be provided, both for initialization and API calls. Passing objects and using [ES6 rest / spread and object destructuring](http://www.datchley.name/es6-rest-spread-defaults-and-destructuring/) is best practice here as it makes adding and removing parameters in future much simpler.

Let's take a look at how our graph component might look without filters. We'll add these next.

```Javascript
import React, { Component } from 'react'
import createClient from 'webpack-worker/client'
import Plotly from 'plotly.js/dist/plotly-basic.js'

export default class Graph extends Component {
  componentDidMount = () => {
    // create a client for our worker API, passing in the URL
    // the promise resolves once initialization has finished
    createClient(new Worker('/static/js/worker.bundle.js'), '/sp500hst.txt')
      // call our topTenMovers API function
      .then(worker => {
        this.worker = worker
        this.renderGraph()
      })
  }

  renderGraph = (filter = {}) => {
    this.setState({ filter })
    this.worker.topTenMovers(filter)
      .then(data => Plotly.newPlot(this.element, [data]))
  }

  // render a container for our graph and create a reference to it
  render = () => <div ref={element => this.element = element}></div>
}
```

Pretty simple stuff. You'll notice we kept graph rendering logic separate in the `renderGraph` function. We'll reuse this when we add a date filter.

## Dynamically Filtering

For a simple solution to our UI needs, we'll use the `react-input-range` NPM package. Let's add it to our component:

```Javascript
// ...
import InputRange from 'react-input-range'

export default class WithWorkers extends Component {
  // set the default filter value - we are hard coding this range for simplicity
  state = {
    filter: {
      min: new Date(2009, 7, 21).getTime(),
      max: new Date(2014, 7, 21).getTime()
    }
  }
// ...
  render = () => (
    <div>
      <div className="filter">
        <InputRange  
          minValue={new Date(2009, 7, 21).getTime()}
          maxValue={new Date(2014, 7, 21).getTime()}
          value={this.state.filter}
          step={86400000} // one day
          onChange={filter => this.renderGraph(filter)}
          formatLabel={value => new Date(value).toLocaleDateString()} />
      </div>
      <div ref={element => this.element = element}></div>
    </div>
  )
}
```

Things are starting to look pretty good! Now, as we drag the date slider, the graph updates. There's a problem, though. As we drag the slider, it queues up a filter for every move event onto our worker, which tirelessly attempts to fulfil all of our requests... long after we've finished dragging the slider.

## Throttling

Fortunately, `webpack-worker` gives us a simple way to throttle our requests to produce the most responsive behavior. Applying it is simple:

```Javascript
import throttle from 'webpack-worker/throttle.mostRecent'
// ...
  componentDidMount = () => {
    createClient(
      new Worker('/static/js/worker.bundle.js'), 
      '/sp500hst.txt'
    ).then(client => {
      this.worker = throttle.applyTo(client) // apply throttling to API requests
      this.renderGraph(this.state.filter)
    })
  }
// ...
```

The `applyTo` function attaches a throttle to all function members of the supplied object. When throttled, if requests are made while the worker is already busy, only the most recent request is queued, all others are dropped.

When requests are dropped, the returned promise is rejected, so we need to handle the rejection in our `renderGraph` function:

```Javascript
  renderGraph = filter => {
    this.setState({ filter })
    this.worker.topTenMovers(filter)
      .then(data => Plotly.newPlot(this.element, [data]))
      // ignore any dropped packets. we need to handle any errors coming out of the worker here
      .catch(error => error.dropped || console.error(error))
  }
```

## Configuring webpack

As discussed, worker processes are isolated threads that require their own entry point. Correspondingly, we can create entry points in our webpack configuration. This is a simple matter of creating a worker node in the entry hash, for example:

```Javascript
module.exports = {
  entry: {
    app: [/* app entry point here */],
    worker: require.resolve('../src/worker')
  },
  output: {
    filename: 'static/js/[name].bundle.js',
  }
}
```

If your app was created with `create-react-app`, there are a couple of additional steps that are described [here](https://github.com/danderson00/webpack-worker).

## Wrapping Up

You can see a working example of what we've discussed here contrasted with running everything on the main UI thread [here](https://danderson00.github.io/webpack-worker/).

The full source to this sample is available in the `webpack-worker` repository [here](https://github.com/danderson00/webpack-worker/samples/plotly).