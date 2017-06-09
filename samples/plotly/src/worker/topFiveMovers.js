export default function (data, filter) {
  var filtered = data.findRange(filter.start, filter.end, x => x.key)

  // this is a rather naive solution that assumes all stocks have a record on the first day
  return Object.keys(filtered[0]).map(stock => ({
      stock: stock,
      start: filtered[0][stock].start,
      end: filtered[filtered.length - 1][stock].end
    }))
    .map(stock => ({ ...stock, gain: (stock.end - stock.start) / stock.start }))
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 5)

  // var stocks = filtered.reduce((aggregate, day) => {
  //   Object.keys(day).forEach(stock => aggregate[stock] = {
  //     stock: stock,
  //     high: 
  //     low:
  //   })
  //   return stocks
  // }, {})
}