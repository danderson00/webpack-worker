import React, { Component } from 'react'
import WithoutWorkers from './WithoutWorkers'
import WithWorkers from './WithWorkers'
import 'react-input-range/lib/css/index.css'

export default class App extends Component {
  // we are just hard coding this range for simplicity
  state = {
    withFilter: {
      min: new Date(2009, 7, 21).getTime(),
      max: new Date(2010, 7, 21).getTime()
    },
    withoutFilter: {
      min: new Date(2009, 7, 21).getTime(),
      max: new Date(2010, 7, 21).getTime()
    }
  }

  render = () => (
    <div>
      <div>
        <WithWorkers />
        <WithoutWorkers />
      </div>
    </div>
  )
}
