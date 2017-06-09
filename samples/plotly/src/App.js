import React, { Component } from 'react'
import InputRange from 'react-input-range'
import Graph from './Graph'
import './App.css';

export default class App extends Component {
  render = () => (
    <div>
      <InputRange />
      <Graph />
    </div>
  )
}
