// data provided by http://pages.swcp.com/stocks/
// format is CSV (date, stock, start, low, high, end, ?)

const parseDate = value => new Date(+value.substr(0, 4), +value.substr(4, 2), +value.substr(6, 2))
const sortGroups = (a, b) => a.key - b.key

export default function(text) {
  return text.split('\n').groupBy(parseDate, 
    line => {
      var values = day.split(',')
      return {
        stock: values[1],
        start: +values[2],
        low: +values[3],
        high: +values[4],
        end: +values[5]
      }
    },
    group => group.mapIntoObject(x => x.stock)
  ).sort(sortGroups)
}