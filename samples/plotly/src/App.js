import React, { Component } from 'react'
import WithoutWorkers from './WithoutWorkers'
import WithWorkers from './WithWorkers'
import 'react-input-range/lib/css/index.css'

export default class App extends Component {
  render = () => (
    <div>
      <WithWorkers />
      <WithoutWorkers />
    </div>
  )
}
