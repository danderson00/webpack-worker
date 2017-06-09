import React, { Component } from 'react'
import InputRange from 'react-input-range'
import topFiveMovers from './worker/topFiveMovers'
import parseFile from './worker/parseFile'
import Plotly from 'plotly.js/dist/plotly-basic.js'

export default class WithoutWorkers extends Component {
  state = {
    filter: {
      min: new Date(2009, 7, 21).getTime(),
      max: new Date(2010, 7, 21).getTime()
    }
  }

  componentDidMount = () => {
    fetch('/sp500hst.txt')
      .then(response => response.text())
      .then(text => {
        this.data = parseFile(text)
        this.renderGraph(this.state.filter)
      })
  }

  renderGraph = filter => {
    this.setState({ filter })
    Plotly.newPlot(this.element, [topFiveMovers(this.data, filter)])
  }

  render = () => (
    <div>
      <div className="filter">
        <InputRange  
          minValue={new Date(2009, 7, 21).getTime()}
          maxValue={new Date(2010, 7, 21).getTime()}
          value={this.state.filter}
          step={86400000}
          onChange={filter => this.renderGraph(filter)}
          formatLabel={value => new Date(value).toLocaleDateString()} />
      </div>
      <div ref={element => this.element = element}></div>
    </div>
  )
}
