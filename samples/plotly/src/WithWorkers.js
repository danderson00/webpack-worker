import React, { Component } from 'react'
import InputRange from 'react-input-range'
import createClient from 'webpack-worker/client'
import throttle from 'webpack-worker/throttle.mostRecent'
import Plotly from 'plotly.js/dist/plotly-basic.js'

export default class WithWorkers extends Component {
  // we are just hard coding this range for simplicity
  state = {
    filter: {
      min: new Date(2009, 7, 21).getTime(),
      max: new Date(2014, 7, 21).getTime()
    }
  }

  componentDidMount = () => {
    createClient(
      new Worker('/static/js/worker.bundle.js'), 
      '/sp500hst.txt'
    ).then(client => {
      this.worker = throttle.applyTo(client)
      this.renderGraph(this.state.filter)
    })
  }

  renderGraph = filter => {
    this.setState({ filter })
    this.worker.topTenMovers(filter)
      .then(data => Plotly.newPlot(this.element, [data]))
      .catch(error => error.dropped || console.error(error))
  }

  render = () => (
    <div>
      <h3>With WebWorkers</h3>
      <div className="filter">
        <InputRange  
          minValue={new Date(2009, 7, 21).getTime()}
          maxValue={new Date(2014, 7, 21).getTime()}
          value={this.state.filter}
          step={86400000}
          onChange={filter => this.renderGraph(filter)}
          formatLabel={value => new Date(value).toLocaleDateString()} />
      </div>
      <div ref={element => this.element = element}></div>
    </div>
  )
}
