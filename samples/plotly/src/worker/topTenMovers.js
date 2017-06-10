export default function (data, filter) {
  // filter our data the the selected date range
  var filtered = data.findRange(filter.min, filter.max, x => x.key)

  // aggregate the data for each stock
  var stocks = filtered.reduce((aggregate, day) => {
    Object.keys(day.value).forEach(stock => {
      var existing = aggregate[stock] || {}
      var today = day.value[stock]

      aggregate[stock] = {
        stock: stock,
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
    .map(stock => ({
      stock: stock,
      gain: (stocks[stock].end - stocks[stock].start) / stocks[stock].start
    }))
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 10)
  
  // map into vectors that Plotly understands
  return {
    x: topMovers.map(x => x.stock),
    y: topMovers.map(x => x.gain),
    type: 'bar'
  }
}