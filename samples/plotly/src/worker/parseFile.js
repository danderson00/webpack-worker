// data provided by http://pages.swcp.com/stocks/
// format is CSV (date, stock, start, low, high, end, ?)

const parseDate = (value, yearsToAdd) => new Date(+value.substr(0, 4) + yearsToAdd, +value.substr(4, 2), +value.substr(6, 2))
const sortGroups = (a, b) => a.key - b.key

export default function(text) {
  // duplicate the same year's worth of data over five years to better demonstrate the lag without workers
  return parse(text, 0)
    .concat(parse(text, 1))
    .concat(parse(text, 2))
    .concat(parse(text, 3))
    .concat(parse(text, 4))
}

function parse(text, yearsToAdd) {
  return text.trim().split('\n').groupBy(line => parseDate(line, yearsToAdd),
    line => {
      var values = line.split(',')
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