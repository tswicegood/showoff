var chartHandlers = {
  // This is a helper function that will extract the values from a 'table' element, 
  // generating a list of labels and a number of series.  It then yields the labels and
  // series back to the callback.
  extractSeries: function(table, callback) {
    var labels = [], series = [];
    $("tr", table).each(function () {
      $('td', this).each(function(index,cell) {
        values = (series[index] = series[index] || [])
        values.push(parseInt($(cell).text(), 10));
      });
      labels.push($("th", this).text());
    });
    callback(labels, series);
  },

  // Generates a pie chart.
  pie: function(chart, table) {
    var labels, series;
    this.extractSeries(table, function(l,v) { labels = l, series = v; });

    // Make sure that the chart scales into the slide
    var minimumDimension = chart.width() < chart.height() ? chart.width() : chart.height();
    var center           = minimumDimension / 2;
    var radius           = (2 * minimumDimension) / 6; // Diameter = 2/3 minimumDimension

    return function(raphael) {
      raphael(chart[0], chart.width(), chart.height()).g.piechart(
        chart.width() / 2, chart.height() / 2, radius, 
        series[0], {
          legend: labels,
          legendpos: 'west'
        }
      );
    };
  },

  // Generates a barchart, both single and multi-series versions.
  bar: function(chart, table, options) {
    var labels, series;
    this.extractSeries(table, function(l,v) { labels = l, series = v; });

    options = options || {};

    return function(raphael) {
      raphael(chart[0], chart.width(), chart.height()).g.barchart(
        0, 0, chart.width(), chart.height(),
        series,
        options
      );
    };
  },

  // Generates a stacked barchart.
  stacked: function(chart, table, options) {
    return this.bar(chart, table, { stacked: true });
  }
};
