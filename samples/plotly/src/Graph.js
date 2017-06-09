import React, { Component } from 'react'
import createClient from 'webpack-worker/client'
import throttle from 'webpack-worker/throttle.mostRecent'

export default class Graph extends Component {
  componentHasMounted = () => {
    createClient(
      new Worker('/static/js/graph.bundle.js'), 
      'sp500hst.txt'
    ).then(client => {
      this.topFiveMovers = throttle(client.topFiveMovers)
      renderGraph(this.props.filter)
    })
  }

  componentWillReceiveProps = newProps => {
    renderGraph(newProps.filter)
  }

  renderGraph = filter => {
    this.topFiveMovers(filter)
      .then(data => Plotly.newPlot(this.element, [data]))
      .catch(error => error.dropped || console.error(error))
  }

  render = () => <div ref={element => this.element = element}></div>
}
