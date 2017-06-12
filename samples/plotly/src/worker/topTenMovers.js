export default function (data, filter) {
  // filter our data the the selected date range
  var filtered = data.findRange(filter.min, filter.max, x => x.key)

  // aggregate the data for each stock
  var stocks = filtered.reduce((aggregate, day) => {
    Object.keys(day.value).forEach(symbol => {
      var existing = aggregate[symbol] || {}
      var today = day.value[symbol]

      aggregate[symbol] = {
        stock: symbol,
        start: existing.start || today.start,
        end: today.end,
        high: existing.high > today.high ? existing.high : today.high,
        low: existing.low < today.low ? existing.low : today.low
      }
    })
    return aggregate
  }, {})

  // find our top ten movers
  var topMovers = Object.keys(stocks)
    .map(symbol => {
      var stock = stocks[symbol]
      return {
        stock: symbol,
        gain: (stock.end - stock.start) / stock.start * 100,
        relativeHigh: (stock.high - stock.start) / stock.start * 100,
        relativeLow: (stock.low - stock.start) / stock.start * 100
      }
    })
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 10)
  
  // map into vectors that Plotly understands
  return [
    {
      x: topMovers.map(x => x.stock),
      y: topMovers.map(x => x.relativeLow),
      name: 'Low',
      type: 'bar'
    },
    {
      x: topMovers.map(x => x.stock),
      y: topMovers.map(x => x.gain),
      name: 'Gain',
      type: 'bar'
    },
    {
      x: topMovers.map(x => x.stock),
      y: topMovers.map(x => x.relativeHigh),
      name: 'High',
      type: 'bar'
    }
  ]
}